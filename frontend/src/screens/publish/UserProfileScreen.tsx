import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, BorderRadius, FontSize } from '../../theme';
import { AppHeader, Avatar, HoverView, BeadGrid, ALL_PATTERNS, PressableScale } from '../../components/common';
import { getFeedMockMedia } from '../../utils/feedMedia';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { shareText, buildUserShareMessage } from '../../utils/share';
import type { RootScreenProps, RootStackParamList } from '../../navigation/types';
import { useUiConfig } from '../../store/useUiConfigStore';

interface ProfileTabDef {
  label: string;
  icon: string;
  iconActive: string;
}

const FALLBACK_PROFILE_TABS: ProfileTabDef[] = [
  { label: '作品', icon: 'view-grid-outline', iconActive: 'view-grid' },
  { label: '动态', icon: 'text-box-outline', iconActive: 'text-box' },
  { label: '喜欢', icon: 'heart-outline', iconActive: 'heart' },
];
import {
  designApi,
  feedApi,
  followApi,
  likeApi,
  type CommunityUserData,
  type FeedItemData,
  type PublicDesignItem,
  type UserLikedItem,
} from '../../api/community';
import { userApi } from '../../api/user';
import { useAuthStore } from '../../store/useAuthStore';

const PAD = wp(15);
const GRID_GAP = wp(8);

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function getGenderBadgeMeta(gender?: string | null) {
  const normalized = (gender || '').trim().toLowerCase();

  if (normalized.includes('男') || normalized === 'male') {
    return { icon: 'gender-male', color: '#2563EB', bg: '#EAF2FF' };
  }

  if (normalized.includes('女') || normalized === 'female') {
    return { icon: 'gender-female', color: '#EC4899', bg: '#FFEAF3' };
  }

  return { icon: 'gender-male-female', color: '#64748B', bg: '#EEF4FF' };
}

// 后端 designData 是 JSON 字符串（也可能是 mock 路径下的数组），统一解析成 string[][]
function parseUserDesignGrid(raw: unknown): string[][] | null {
  if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) return raw as string[][];
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
        return parsed as string[][];
      }
    } catch { /* ignore corrupt */ }
  }
  return null;
}

function inferCommunityGender(name: string) {
  if (name.includes('木木') || name.includes('清晨') || name.includes('饰品')) {
    return '女';
  }

  if (name.includes('像素') || name.includes('游戏') || name.includes('拼豆')) {
    return '男';
  }

  return '保密';
}

export const UserProfileScreen: React.FC<RootScreenProps<'UserProfile'>> = ({ route }) => {
  const { userName } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profileTabs = useUiConfig<ProfileTabDef[]>('profile.tabs', FALLBACK_PROFILE_TABS);
  const [user, setUser] = useState<CommunityUserData>(() => ({
    id: null,
    name: userName,
    title: '创作者',
    bio: '',
    followers: 0,
    following: 0,
    posts: 0,
    likes: 0,
    joinDate: '',
    tags: [],
  }));
  const [works, setWorks] = useState<PublicDesignItem[]>([]);
  const [feeds, setFeeds] = useState<FeedItemData[]>([]);
  const [likedItems, setLikedItems] = useState<UserLikedItem[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    userApi
      .getCommunityProfile(userName)
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => undefined);
  }, [userName]);

  // tab 切换 → 按需拉数据（已有的就不重复拉）
  useEffect(() => {
    if (!user.id) return;
    if (tabIndex === 0 && works.length === 0) {
      setTabLoading(true);
      designApi.byUser(user.id)
        .then((res) => setWorks(res.data?.records || []))
        .catch(() => setWorks([]))
        .finally(() => setTabLoading(false));
    } else if (tabIndex === 1 && feeds.length === 0) {
      setTabLoading(true);
      feedApi.byUser(user.id)
        .then((res) => setFeeds(res.data?.records || []))
        .catch(() => setFeeds([]))
        .finally(() => setTabLoading(false));
    } else if (tabIndex === 2 && likedItems.length === 0) {
      setTabLoading(true);
      likeApi.byUser(user.id)
        .then((res) => setLikedItems(res.data || []))
        .catch(() => setLikedItems([]))
        .finally(() => setTabLoading(false));
    }
  }, [tabIndex, user.id]);

  const profileGender = user.gender || inferCommunityGender(user.name);

  const [followed, setFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const isSelf = currentUser?.id != null && currentUser.id === user.id;

  // 进入页面回填关注状态
  useEffect(() => {
    let alive = true;
    if (user.id && currentUser && !isSelf) {
      followApi.check(user.id)
        .then((res) => { if (alive) setFollowed(!!res.data); })
        .catch(() => undefined);
    } else {
      setFollowed(false);
    }
    return () => { alive = false; };
  }, [user.id, currentUser?.id, isSelf]);

  const handleToggleFollow = async () => {
    if (followBusy) return;
    if (blocked) {
      Alert.alert('已拉黑用户', '取消拉黑后才可以重新关注。');
      return;
    }
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再关注。');
      return;
    }
    if (!user.id) {
      Alert.alert('无法关注', '该用户尚未注册或信息缺失。');
      return;
    }
    if (isSelf) {
      Alert.alert('提示', '不能关注自己。');
      return;
    }
    const next = !followed;
    setFollowed(next);
    setFollowBusy(true);
    try {
      if (next) await followApi.follow(user.id);
      else await followApi.unfollow(user.id);
    } catch (err: any) {
      setFollowed(!next);
      Alert.alert('操作失败', err?.message || '请稍后重试');
    } finally {
      setFollowBusy(false);
    }
  };

  const workGridSize = (screenW - PAD * 2 - GRID_GAP * 2) / 3;
  const mediaGridSize = (screenW - PAD * 2 - GRID_GAP) / 2;
  const stats = [
    { label: '作品', value: user.posts, icon: 'view-grid-outline' as const, color: '#4F8DFF' },
    { label: '粉丝', value: user.followers, icon: 'account-group-outline' as const, color: '#FF6B8A' },
    { label: '关注', value: user.following, icon: 'account-heart-outline' as const, color: '#F59E0B' },
    { label: '获赞', value: user.likes, icon: 'heart-outline' as const, color: '#EF4444' },
  ];

  const submitReport = (reason: string) => {
    Alert.alert('举报已提交', `已记录「${reason}」，平台会优先检查该用户近期内容。`);
  };

  const openReportMenu = () => {
    Alert.alert('举报用户', `请选择举报「${user.name}」的原因。`, [
      { text: '垃圾营销', onPress: () => submitReport('垃圾营销') },
      { text: '侵权或盗图', onPress: () => submitReport('侵权或盗图') },
      { text: '不友善或违规内容', onPress: () => submitReport('不友善或违规内容') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const toggleBlockUser = () => {
    if (blocked) {
      setBlocked(false);
      Alert.alert('已取消拉黑', `你可以继续查看「${user.name}」的主页和私信。`);
      return;
    }

    Alert.alert('拉黑用户', `拉黑后将不再接收「${user.name}」的私信和互动提醒。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确认拉黑',
        style: 'destructive',
        onPress: async () => {
          setBlocked(true);
          if (followed && user.id) {
            try {
              await followApi.unfollow(user.id);
            } catch {
              // 拉黑成功但取消关注失败，前端先标 false，下次进入会重新校准
            }
          }
          setFollowed(false);
          Alert.alert('已拉黑', `已将「${user.name}」加入黑名单。`);
        },
      },
    ]);
  };

  const openMoreMenu = () => {
    Alert.alert('更多', `选择对「${user.name}」的操作。`, [
      {
        text: '发送私信',
        onPress: () => {
          if (blocked) {
            Alert.alert('无法发送私信', '请先取消拉黑后再发起私信。');
            return;
          }
          navigation.navigate('DirectMessage', { userName: user.name });
        },
      },
      { text: '分享主页', onPress: () => Alert.alert('分享主页', `已生成「${user.name}」的主页分享口令。`) },
      { text: '举报用户', style: 'destructive', onPress: openReportMenu },
      { text: blocked ? '取消拉黑' : '拉黑用户', style: blocked ? 'default' : 'destructive', onPress: toggleBlockUser },
      { text: '取消', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader
        title={user.name}
        onBack={() => navigation.goBack()}
        right={
          <HoverView
            onPress={openMoreMenu}
            style={[$.navBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            hoverScale={1.08}
            hoverLift={0}
          >
            <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
          </HoverView>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(30) + BOTTOM_SAFE_H }}>
        <View style={[$.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={$.profileTop}>
            <View style={[$.avatarRing, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
              <Avatar name={user.name} size={wp(68)} />
            </View>
            <View style={$.profileIdentity}>
              <View style={$.nameRow}>
                <Text style={[$.profileName, { color: colors.text }]} numberOfLines={1}>{user.name}</Text>
                <GenderBadge gender={profileGender} />
                <View style={[$.titleBadge, { backgroundColor: colors.accentLight }]}>
                  <MCI name="shield-star-outline" size={fp(12)} color={colors.accent} />
                  <Text style={[$.titleBadgeText, { color: colors.accent }]}>{user.title}</Text>
                </View>
              </View>
              <Text style={[$.profileBio, { color: colors.textSecondary }]} numberOfLines={2}>{user.bio}</Text>
            </View>
          </View>

          <View style={[$.statsRow, { backgroundColor: dark ? colors.inputBg : '#F7FAFF' }]}>
            {stats.map((item) => (
              <Pressable
                key={item.label}
                style={$.statItem}
                onPress={() => {
                  if (item.label === '粉丝' || item.label === '关注') {
                    Alert.alert('提示', '当前演示环境不展示关注关系列表。');
                  }
                }}
              >
                <View style={[$.statIconCircle, { backgroundColor: `${item.color}16` }]}>
                  <MCI name={item.icon} size={fp(14)} color={item.color} />
                </View>
                <Text style={[$.statValue, { color: colors.text }]}>{formatCount(item.value)}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={$.actionRow}>
            {isSelf ? null : (
              <HoverView
                onPress={handleToggleFollow}
                style={[$.followBtn, {
                  backgroundColor: blocked ? colors.inputBg : followed ? 'transparent' : colors.accent,
                  borderColor: blocked || followed ? colors.border : colors.accent,
                  flex: 1,
                  opacity: followBusy ? 0.6 : 1,
                }]}
                hoverScale={1.03}
                hoverLift={0}
              >
                <MCI name={blocked ? 'account-cancel-outline' : followed ? 'check' : 'plus'} size={fp(16)} color={blocked || followed ? colors.textHint : '#fff'} />
                <Text style={[$.followBtnText, { color: blocked || followed ? colors.textHint : '#fff' }]}>{blocked ? '已拉黑' : followed ? '已关注' : '关注'}</Text>
              </HoverView>
            )}
            <HoverView
              onPress={() => {
                if (blocked) {
                  Alert.alert('无法发送私信', '请先取消拉黑后再发起私信。');
                  return;
                }
                navigation.navigate('DirectMessage', { userName: user.name });
              }}
              style={[$.iconAction, { borderColor: colors.border }]}
              hoverScale={1.03}
              hoverLift={0}
            >
              <MCI name="chat-outline" size={fp(18)} color={colors.text} />
            </HoverView>
            <HoverView
              onPress={() => shareText(buildUserShareMessage(user.name), '分享用户')}
              style={[$.iconAction, { borderColor: colors.border }]}
              hoverScale={1.03}
              hoverLift={0}
            >
              <MCI name="share-outline" size={fp(18)} color={colors.text} />
            </HoverView>
          </View>

          <View style={[$.joinInfo, { borderTopColor: colors.divider }]}>
            <View style={$.joinTextRow}>
              <MCI name="calendar-outline" size={fp(13)} color={colors.textHint} />
              <Text style={[$.joinText, { color: colors.textHint }]}>{user.joinDate} 加入</Text>
            </View>
            <View style={$.joinTextRow}>
              <MCI name="image-multiple-outline" size={fp(13)} color={colors.textHint} />
              <Text style={[$.joinText, { color: colors.textHint }]}>近期更新 {feeds.length} 条动态</Text>
            </View>
          </View>
        </View>

        <View style={[$.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {profileTabs.map((tab, index) => {
            const active = index === tabIndex;
            return (
              <HoverView key={tab.label} onPress={() => setTabIndex(index)} style={$.tabItem} hoverScale={1.02} hoverLift={0}>
                <View style={$.tabContent}>
                  <MCI name={(active ? tab.iconActive : tab.icon) as any} size={fp(16)} color={active ? colors.accent : colors.textHint} />
                  <Text style={[$.tabText, { color: active ? colors.text : colors.textHint }, active && { fontWeight: '700' }]}>{tab.label}</Text>
                </View>
                {active && <View style={[$.tabLine, { backgroundColor: colors.accent }]} />}
              </HoverView>
            );
          })}
        </View>

        {tabIndex === 0 && (
          <View style={$.worksContainer}>
            {tabLoading && works.length === 0 ? (
              <EmptyTab icon="view-grid-outline" text="加载中..." hint="" colors={colors} />
            ) : works.length === 0 ? (
              <EmptyTab icon="view-grid-outline" text="还没有作品" hint="作品会在这里集中展示" colors={colors} />
            ) : (
              <View style={$.worksGrid}>
                {works.map((work) => {
                  // 优先用真实 designData（后端 DesignDTO 已经返），缺就用 mock 占位
                  const realGrid = parseUserDesignGrid(work.designData);
                  const pattern = realGrid || ALL_PATTERNS[work.id % ALL_PATTERNS.length];
                  // 大网格用更小的珠子让整张图能塞进 thumb，避免 100×100 溢出
                  const cols = pattern[0]?.length || 9;
                  const rows = pattern.length;
                  const maxDim = Math.max(cols, rows);
                  const beadSize = Math.max(Math.floor((workGridSize - wp(14)) / maxDim) - 1, 2);

                  return (
                    <PressableScale
                      key={work.id}
                      scale={0.97}
                      style={{ width: workGridSize }}
                      onPress={() => navigation.navigate('DesignDetail', {
                        // 把 PublicDesignItem 适配成 DesignItem 形状（缺字段给默认）
                        item: {
                          id: work.id,
                          userId: user.id ?? 0,
                          authorName: work.authorName ?? user.name,
                          title: work.title,
                          description: work.description ?? '',
                          category: work.category ?? '',
                          coverImage: work.coverImage ?? null,
                          designData: (work.designData as any) ?? null,
                          status: work.status,
                          likeCount: work.likeCount,
                          viewCount: work.viewCount,
                          createdAt: '',
                        } as any,
                      })}
                    >
                      <View style={[$.workCard, { backgroundColor: colors.surface, ...shadow(1, 5, 0.06, '#000', 2) }]}>
                        <View style={[$.workPreview, { backgroundColor: dark ? '#222' : '#F8F8FA' }]}>
                          <BeadGrid pixels={pattern} beadSize={Math.min(beadSize, wp(14))} gap={1} round glossy />
                        </View>
                        <View style={$.workInfo}>
                          <Text style={[$.workTitle, { color: colors.text }]} numberOfLines={1}>{work.title}</Text>
                          <View style={$.workStats}>
                            <MCI name="heart-outline" size={fp(12)} color={colors.textHint} />
                            <Text style={[$.workStatText, { color: colors.textHint }]}>{work.likeCount}</Text>
                            <MCI name="eye-outline" size={fp(12)} color={colors.textHint} />
                            <Text style={[$.workStatText, { color: colors.textHint }]}>{work.viewCount}</Text>
                          </View>
                        </View>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {tabIndex === 1 && (
          <View style={$.feedGridWrap}>
            {tabLoading && feeds.length === 0 ? (
              <EmptyTab icon="text-box-outline" text="加载中..." hint="" colors={colors} />
            ) : feeds.length === 0 ? (
              <EmptyTab icon="text-box-outline" text="还没有动态" hint="作者发布的动态会出现在这里" colors={colors} />
            ) : (
              <View style={$.feedGrid}>
                {feeds.map((feed) => {
                  const media = getFeedMockMedia(feed);
                  const thumbW = mediaGridSize;
                  const thumbH = mediaGridSize / (media.aspectRatio || 1);
                  return (
                    <PressableScale
                      key={feed.id}
                      scale={0.985}
                      style={{ width: mediaGridSize }}
                      onPress={() => navigation.navigate('FeedDetail', { feed })}
                    >
                      <View style={[$.mediaGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[$.mediaGridThumb, { borderColor: `${media.accent}20`, width: thumbW, height: thumbH }]}>
                          {media.uri ? (
                            <Image source={{ uri: media.uri }} style={{ width: thumbW, height: thumbH }} resizeMode="cover" />
                          ) : media.beadGrid && media.beadGrid.length > 0 ? (
                            (() => {
                              const cols = Math.max(media.beadGrid[0]?.length || 1, 1);
                              const rows = Math.max(media.beadGrid.length, 1);
                              const beadSize = Math.max(2, Math.min(
                                Math.floor((thumbW - wp(8)) / cols) - 1,
                                Math.floor((thumbH - wp(8)) / rows) - 1,
                              ));
                              return (
                                <View style={{ width: thumbW, height: thumbH, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
                                  <BeadGrid pixels={media.beadGrid} beadSize={beadSize} gap={0.5} round />
                                </View>
                              );
                            })()
                          ) : media.svg ? (
                            <SvgXml xml={media.svg} width={thumbW} height={thumbH} />
                          ) : null}
                          <View style={$.mediaGridBadgeWrap}>
                            <View style={$.mediaGridBadge}>
                              <Text style={$.mediaGridBadgeText}>{feed.media.type === 'video' ? 'VIDEO' : feed.media.type === 'gif' ? 'GIF' : 'PHOTO'}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={$.mediaGridInfo}>
                          <Text style={[$.feedCardContent, { color: colors.textSecondary }]} numberOfLines={2}>{feed.content}</Text>
                        </View>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {tabIndex === 2 && (
          tabLoading && likedItems.length === 0 ? (
            <EmptyTab icon="heart-outline" text="加载中..." hint="" colors={colors} />
          ) : likedItems.length === 0 ? (
            <EmptyTab icon="heart-outline" text="还没有点赞内容" hint="ta 给过赞的作品/动态会出现在这里" colors={colors} />
          ) : (
            <View style={$.likedList}>
              {likedItems.map((item) => (
                <View key={item.id} style={[$.likedRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[$.likedTypeBadge, { backgroundColor: item.targetType === '动态' ? '#FFE4EB' : '#E8F0FF' }]}>
                    <Text style={[$.likedTypeText, { color: item.targetType === '动态' ? '#E5486D' : '#2563EB' }]}>{item.targetType}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[$.likedTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[$.likedMeta, { color: colors.textHint }]} numberOfLines={1}>
                      {item.author ? `${item.author} · ` : ''}{item.timeAgo}
                    </Text>
                  </View>
                  <View style={$.likedStat}>
                    <MCI name="heart" size={fp(13)} color="#EF4444" />
                    <Text style={[$.likedStatText, { color: colors.textHint }]}>{item.likeCount}</Text>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const EmptyTab: React.FC<{ icon: string; text: string; hint: string; colors: any }> = ({ icon, text, hint, colors }) => (
  <View style={$.emptyWrap}>
    <View style={[$.emptyIcon, { backgroundColor: colors.inputBg }]}>
      <MCI name={icon as any} size={fp(24)} color={colors.textHint} />
    </View>
    <Text style={[$.emptyTitle, { color: colors.text }]}>{text}</Text>
    <Text style={[$.emptyHint, { color: colors.textHint }]}>{hint}</Text>
  </View>
);

function GenderBadge({ gender }: { gender?: string | null }) {
  const normalized = (gender || '').trim().toLowerCase();
  if (!normalized || normalized.includes('保密') || normalized === 'secret') {
    return null;
  }

  const meta = getGenderBadgeMeta(gender);

  return (
    <View style={[$.genderBadge, { backgroundColor: meta.bg }]}>
      <MCI name={meta.icon as any} size={fp(14)} color={meta.color} />
    </View>
  );
}

const $ = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(50),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: fp(16), fontWeight: '700' },
  profileCard: {
    marginHorizontal: PAD,
    marginTop: wp(8),
    borderRadius: wp(22),
    borderWidth: 1,
    paddingHorizontal: wp(16),
    paddingTop: wp(14),
    paddingBottom: wp(14),
    ...shadow(1, 8, 0.06, '#1E293B', 2),
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  avatarRing: {
    borderWidth: 4,
    borderRadius: wp(42),
    padding: wp(3),
  },
  profileIdentity: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  profileName: { flexShrink: 1, fontSize: fp(20), fontWeight: '900' },
  genderBadge: {
    width: wp(21),
    height: wp(21),
    borderRadius: wp(10.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
    paddingHorizontal: wp(8),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  titleBadgeText: { fontSize: fp(11), fontWeight: '700' },
  profileBio: { marginTop: wp(7), fontSize: fp(12), lineHeight: fp(18) },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: wp(14),
    borderRadius: wp(16),
    paddingVertical: wp(12),
    paddingHorizontal: wp(4),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIconCircle: {
    width: wp(26),
    height: wp(26),
    borderRadius: wp(13),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(5),
  },
  statValue: { fontSize: fp(15), fontWeight: '900' },
  statLabel: { marginTop: wp(3), fontSize: fp(11) },
  actionRow: { flexDirection: 'row', gap: wp(10), marginTop: wp(14) },
  followBtn: {
    height: wp(38),
    borderRadius: wp(13),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
  },
  followBtnText: { fontSize: fp(13), fontWeight: '700' },
  iconAction: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(13),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
    marginTop: wp(13),
    paddingTop: wp(12),
    borderTopWidth: 1,
  },
  joinTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  joinText: { fontSize: fp(11) },
  tabBar: {
    flexDirection: 'row',
    marginTop: wp(10),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: wp(12) },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: wp(5) },
  tabText: { fontSize: fp(12) },
  tabLine: { marginTop: wp(8), height: wp(3), width: wp(18), borderRadius: wp(2) },
  worksContainer: { paddingHorizontal: PAD, paddingTop: wp(14) },
  worksGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: wp(10) },
  workCard: {
    borderRadius: wp(14),
    overflow: 'hidden',
  },
  workPreview: {
    height: wp(104),
    justifyContent: 'center',
    alignItems: 'center',
  },
  workInfo: { paddingHorizontal: wp(8), paddingVertical: wp(8) },
  workTitle: { fontSize: fp(12), fontWeight: '800' },
  workStats: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(6) },
  workStatText: { fontSize: fp(10) },
  feedGridWrap: { paddingHorizontal: PAD, paddingTop: wp(14) },
  feedGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: wp(10) },
  mediaGridCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mediaGridThumb: {
    minHeight: wp(140),
    overflow: 'hidden',
  },
  mediaGridBadgeWrap: {
    position: 'absolute',
    top: wp(8),
    left: wp(8),
  },
  mediaGridBadge: {
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  mediaGridBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '700',
  },
  mediaGridInfo: { padding: wp(10) },
  feedCardContent: { fontSize: fp(12), lineHeight: fp(17) },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(48), paddingHorizontal: PAD },
  emptyIcon: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(12),
  },
  emptyTitle: { fontSize: fp(15), fontWeight: '700' },
  emptyHint: { marginTop: wp(6), fontSize: fp(12), textAlign: 'center' },
  likedList: { paddingHorizontal: PAD, paddingTop: wp(12), gap: wp(10) },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    padding: wp(12),
    borderRadius: wp(12),
    borderWidth: 1,
  },
  likedTypeBadge: {
    paddingHorizontal: wp(8),
    paddingVertical: wp(3),
    borderRadius: wp(999),
  },
  likedTypeText: { fontSize: fp(10), fontWeight: '800' },
  likedTitle: { fontSize: fp(13), fontWeight: '700' },
  likedMeta: { marginTop: wp(2), fontSize: fp(11) },
  likedStat: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  likedStatText: { fontSize: fp(11), fontWeight: '600' },
});
