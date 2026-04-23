import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, HoverView, BeadGrid, ALL_PATTERNS, PressableScale } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import type { RootStackParamList, FeedItemData } from '../../navigation/types';
import type { RootScreenProps } from '../../navigation/types';

const PAD = wp(15);

/* ──────────────── Mock 用户数据 ──────────────── */

interface UserData {
  name: string;
  title: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  joinDate: string;
  tags: string[];
}

const MOCK_USERS: Record<string, UserData> = {
  '小豆子': { name: '小豆子', title: '拼豆达人 Lv.5', bio: '热爱拼豆三年，擅长动物主题~ 日常分享拼豆技巧和作品', followers: 1280, following: 156, posts: 45, likes: 3200, joinDate: '2023年6月', tags: ['动物', '教程', '新手友好'] },
  '像素艺术家': { name: '像素艺术家', title: '创作者', bio: 'AI + 手工 = 无限创意，分享 AI 辅助创作的各种玩法', followers: 3560, following: 89, posts: 78, likes: 12000, joinDate: '2023年3月', tags: ['AI创作', '星空', '科技'] },
  '花花世界': { name: '花花世界', title: '拼豆达人 Lv.3', bio: '用拼豆记录生活中的美好小事', followers: 892, following: 234, posts: 32, likes: 2100, joinDate: '2024年1月', tags: ['花卉', '礼物', '日常'] },
  '游戏迷': { name: '游戏迷', title: '像素爱好者', bio: '把童年经典游戏角色都做成拼豆！目标：集齐所有马里奥角色', followers: 2100, following: 167, posts: 56, likes: 5800, joinDate: '2023年8月', tags: ['游戏', '马里奥', '复古'] },
  '彩虹桥': { name: '彩虹桥', title: '手作达人', bio: '迷你珠饰品制作 | S925银饰搭配 | 接定制', followers: 5600, following: 78, posts: 120, likes: 23000, joinDate: '2022年11月', tags: ['饰品', '耳环', '定制'] },
  '钻石控': { name: '钻石控', title: '新人创作者', bio: '刚入坑的拼豆新手，专注宝石系列', followers: 156, following: 312, posts: 8, likes: 420, joinDate: '2025年2月', tags: ['宝石', '新手'] },
  '拼豆小屋': { name: '拼豆小屋', title: '拼豆达人 Lv.8', bio: '8年拼豆老玩家 | 教程分享 | 材料推荐\n让每个人都能享受拼豆的乐趣', followers: 12800, following: 45, posts: 256, likes: 89000, joinDate: '2021年5月', tags: ['教程', '材料', '进阶'] },
};

function getUserData(name: string): UserData {
  return MOCK_USERS[name] || {
    name, title: '拼豆爱好者', bio: '这个人很懒，什么都没写~',
    followers: 42, following: 88, posts: 5, likes: 120, joinDate: '2025年1月', tags: [],
  };
}

// 确定性 mock 作品
const WORK_TITLES = ['萌宠小猫', '星空幻想', '春日花束', '马里奥蘑菇', '樱桃耳环', '蓝宝石', '彩虹挂画', '像素小屋'];
function getUserWorks(name: string): { patternIdx: number; likeCount: number; title: string; commentCount: number }[] {
  const seed = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const count = Math.min(getUserData(name).posts, 6);
  return Array.from({ length: count }, (_, i) => ({
    patternIdx: (seed + i) % ALL_PATTERNS.length,
    likeCount: ((seed * (i + 1) * 7) % 500) + 10,
    commentCount: ((seed * (i + 1) * 3) % 80) + 2,
    title: WORK_TITLES[(seed + i) % WORK_TITLES.length],
  }));
}

// 确定性 mock 动态
function getUserFeeds(name: string): FeedItemData[] {
  const user = getUserData(name);
  const seed = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const contents = [
    '刚完成一个新作品，满意度 100%！',
    '今天尝试了新的配色方案，效果出乎意料~',
    '终于把这个高难度的图案拼完了！',
    '分享一个小技巧：熨烫前记得铺一层烘焙纸~',
  ];
  return contents.slice(0, Math.min(3, user.posts)).map((c, i) => ({
    id: seed * 100 + i,
    user: { name: user.name, title: user.title },
    content: c,
    patternIdx: (seed + i) % ALL_PATTERNS.length,
    likeCount: ((seed * (i + 1) * 7) % 300) + 20,
    commentCount: ((seed * (i + 1) * 3) % 50) + 5,
    shareCount: ((seed * (i + 1) * 2) % 20) + 1,
    timeAgo: ['1天前', '3天前', '1周前'][i] || '2周前',
    tags: user.tags.slice(0, 2),
  }));
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const PROFILE_TABS = [
  { label: '作品', icon: 'view-grid-outline' as const, iconActive: 'view-grid' as const },
  { label: '动态', icon: 'text-box-outline' as const, iconActive: 'text-box' as const },
  { label: '喜欢', icon: 'heart-outline' as const, iconActive: 'heart' as const },
];

/* ──────────────── 主屏幕 ──────────────── */

export const UserProfileScreen: React.FC<RootScreenProps<'UserProfile'>> = ({ route }) => {
  const { userName } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = getUserData(userName);
  const works = useMemo(() => getUserWorks(userName), [userName]);
  const feeds = useMemo(() => getUserFeeds(userName), [userName]);

  const [followed, setFollowed] = useState(false);
  const [profileTab, setProfileTab] = useState(0);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* ═══ 顶栏 ═══ */}
      <View style={[$.topBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={$.navBtn} hoverScale={1.1} hoverLift={0}>
          <MCI name="arrow-left" size={fp(22)} color={colors.text} />
        </HoverView>
        <Text style={[$.topBarTitle, { color: colors.text }]}>{user.name}</Text>
        <HoverView onPress={() => Alert.alert('更多', '举报或拉黑该用户', [
          { text: '举报', onPress: () => Alert.alert('已举报', '感谢反馈') },
          { text: '拉黑', style: 'destructive', onPress: () => Alert.alert('已拉黑') },
          { text: '取消', style: 'cancel' },
        ])} style={$.navBtn} hoverScale={1.1} hoverLift={0}>
          <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
        </HoverView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(30) + BOTTOM_SAFE_H }}>
        {/* ═══ 用户卡片 — accent 渐变头部 ═══ */}
        <View style={[$.headerBg, { backgroundColor: colors.accent }]}>
          <View style={$.headerDecor} />
        </View>
        <View style={[$.profileCard, { backgroundColor: colors.surface }]}>
          <View style={$.avatarWrap}>
            <View style={[$.avatarRing, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
              <Avatar name={user.name} size={wp(72)} />
            </View>
          </View>

          <Text style={[$.profileName, { color: colors.text }]}>{user.name}</Text>
          <View style={[$.titleBadge, { backgroundColor: colors.accentLight }]}>
            <MCI name="shield-star-outline" size={fp(12)} color={colors.accent} />
            <Text style={[$.titleBadgeText, { color: colors.accent }]}>{user.title}</Text>
          </View>
          <Text style={[$.profileBio, { color: colors.textSecondary }]}>{user.bio}</Text>

          {/* 标签 */}
          {user.tags.length > 0 && (
            <View style={$.profileTags}>
              {user.tags.map((t) => (
                <View key={t} style={[$.profileTag, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.profileTagText, { color: colors.textHint }]}>#{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 统计 */}
          <View style={[$.statsRow, { borderTopColor: colors.border }]}>
            {([
              { label: '作品', value: user.posts, icon: 'view-grid-outline' as const, color: colors.candy.bubblegum },
              { label: '粉丝', value: user.followers, icon: 'account-group-outline' as const, color: colors.candy.mango },
              { label: '关注', value: user.following, icon: 'account-heart-outline' as const, color: colors.candy.sunshine },
              { label: '获赞', value: user.likes, icon: 'heart-outline' as const, color: colors.candy.grape },
            ] as const).map((s) => (
              <Pressable key={s.label} style={$.statItem} onPress={() => {
                if (s.label === '粉丝' || s.label === '关注') Alert.alert(`${s.label}列表`, '即将上线~');
              }}>
                <View style={[$.statIconCircle, { backgroundColor: s.color + '15' }]}>
                  <MCI name={s.icon} size={fp(14)} color={s.color} />
                </View>
                <Text style={[$.statValue, { color: colors.text }]}>{formatCount(s.value)}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* 操作按钮 */}
          <View style={$.actionRow}>
            <HoverView
              onPress={() => setFollowed(!followed)}
              style={[$.followBtn, {
                backgroundColor: followed ? 'transparent' : colors.accent,
                borderColor: followed ? colors.border : colors.accent,
                flex: 1,
              }]}
              hoverScale={1.03} hoverLift={0}
            >
              <MCI name={followed ? 'check' : 'plus'} size={fp(16)} color={followed ? colors.textHint : '#fff'} />
              <Text style={[$.followBtnText, { color: followed ? colors.textHint : '#fff' }]}>
                {followed ? '已关注' : '关注'}
              </Text>
            </HoverView>
            <HoverView
              onPress={() => Alert.alert('私信', '私信功能即将上线~')}
              style={[$.msgBtn, { borderColor: colors.border }]}
              hoverScale={1.03} hoverLift={0}
            >
              <MCI name="chat-outline" size={fp(18)} color={colors.text} />
            </HoverView>
            <HoverView
              onPress={() => {}}
              style={[$.msgBtn, { borderColor: colors.border }]}
              hoverScale={1.03} hoverLift={0}
            >
              <MCI name="share-outline" size={fp(18)} color={colors.text} />
            </HoverView>
          </View>

          {/* 加入时间 */}
          <View style={$.joinInfo}>
            <MCI name="calendar-outline" size={fp(13)} color={colors.textHint} />
            <Text style={[$.joinText, { color: colors.textHint }]}>{user.joinDate} 加入</Text>
          </View>
        </View>

        {/* ═══ Tab 切换 ═══ */}
        <View style={[$.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {PROFILE_TABS.map((t, i) => {
            const active = i === profileTab;
            return (
              <HoverView key={t.label} onPress={() => setProfileTab(i)} style={$.tabItem} hoverScale={1.03} hoverLift={0}>
                <View style={$.tabContent}>
                  <MCI name={active ? t.iconActive : t.icon} size={fp(16)} color={active ? colors.accent : colors.textHint} />
                  <Text style={[$.tabText, { color: active ? colors.text : colors.textHint }, active && { fontWeight: '700' }]}>{t.label}</Text>
                </View>
                {active && <View style={[$.tabLine, { backgroundColor: colors.accent }]} />}
              </HoverView>
            );
          })}
        </View>

        {/* ═══ Tab 内容 ═══ */}
        {profileTab === 0 && (
          <View style={$.worksContainer}>
            {works.length === 0 ? (
              <EmptyTab icon="view-grid-outline" text="还没有作品" hint="创作第一个作品吧~" colors={colors} />
            ) : (
              <View style={$.worksGrid}>
                {works.map((p, i) => {
                  const pat = ALL_PATTERNS[p.patternIdx % ALL_PATTERNS.length];
                  const patCols = pat[0]?.length || 9;
                  const patRows = pat.length || 9;
                  const bs = Math.max(Math.min(wp(10), Math.floor(wp(100) / Math.max(patCols, patRows))), wp(3));
                  return (
                    <View key={i} style={$.workCol}>
                      <PressableScale scale={0.97}
                        onPress={() => navigation.navigate('Editor', { mode: 'manual', cols: patCols, rows: patRows })}
                      >
                        <View style={[$.workCard, { backgroundColor: colors.surface, ...shadow(3, 10, 0.08, '#FF8FB1', 2) }]}>
                          <View style={[$.workPreview, { backgroundColor: dark ? '#222' : '#f8f8fa' }]}>
                            <BeadGrid pixels={pat} beadSize={bs} gap={1} round glossy />
                          </View>
                          <View style={$.workInfo}>
                            <Text style={[$.workTitle, { color: colors.text }]} numberOfLines={1}>{p.title}</Text>
                            <View style={$.workStats}>
                              <MCI name="heart-outline" size={fp(12)} color={colors.textHint} />
                              <Text style={[$.workStatText, { color: colors.textHint }]}>{p.likeCount}</Text>
                              <MCI name="comment-outline" size={fp(12)} color={colors.textHint} />
                              <Text style={[$.workStatText, { color: colors.textHint }]}>{p.commentCount}</Text>
                            </View>
                          </View>
                        </View>
                      </PressableScale>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {profileTab === 1 && (
          <View style={$.feedsContainer}>
            {feeds.length === 0 ? (
              <EmptyTab icon="pencil-outline" text="还没有动态" hint="发布第一条动态吧~" colors={colors} />
            ) : (
              feeds.map((feed) => {
                const pat = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
                const bs = Math.floor(wp(50) / (pat[0]?.length || 9)) - 1;
                return (
                  <Pressable
                    key={feed.id}
                    onPress={() => navigation.push('FeedDetail', { feed })}
                    style={[$.feedItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[$.feedContent, { color: colors.text }]} numberOfLines={2}>{feed.content}</Text>
                      <View style={$.feedMeta}>
                        <Text style={[$.feedTime, { color: colors.textHint }]}>{feed.timeAgo}</Text>
                        <View style={$.feedStats}>
                          <MCI name="heart-outline" size={fp(12)} color={colors.textHint} />
                          <Text style={[$.feedStatText, { color: colors.textHint }]}>{feed.likeCount}</Text>
                          <MCI name="comment-outline" size={fp(12)} color={colors.textHint} />
                          <Text style={[$.feedStatText, { color: colors.textHint }]}>{feed.commentCount}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[$.feedThumb, { backgroundColor: dark ? '#222' : '#f8f8fa' }]}>
                      <BeadGrid pixels={pat} beadSize={Math.max(bs, wp(4))} gap={0} round />
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        {profileTab === 2 && (
          <EmptyTab icon="heart-outline" text="喜欢的内容" hint="这里会展示 TA 点赞过的内容~" colors={colors} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ──────────────── 空状态 ──────────────── */

const EmptyTab: React.FC<{ icon: string; text: string; hint: string; colors: ThemeColors }> = ({ icon, text, hint, colors }) => (
  <View style={$.emptyTab}>
    <View style={[$.emptyIcon, { backgroundColor: colors.inputBg }]}>
      <MCI name={icon as any} size={fp(26)} color={colors.textHint} />
    </View>
    <Text style={[$.emptyTitle, { color: colors.text }]}>{text}</Text>
    <Text style={[$.emptyHint, { color: colors.textHint }]}>{hint}</Text>
  </View>
);

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  /* 顶栏 */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: wp(48), paddingHorizontal: wp(6), borderBottomWidth: 1,
  },
  navBtn: { width: wp(40), height: wp(40), justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontSize: fp(17), fontWeight: '600' },

  /* accent 头部 */
  headerBg: { height: wp(80) },
  headerDecor: {
    position: 'absolute', bottom: -wp(30), left: -wp(30),
    width: wp(120), height: wp(120), borderRadius: wp(60),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  /* 用户卡片 */
  profileCard: {
    marginTop: -wp(40), marginHorizontal: PAD,
    borderRadius: BorderRadius.xxl, paddingHorizontal: wp(18), paddingBottom: wp(18),
    ...shadow(4, 14, 0.12, '#FF8FB1', 4),
  },
  avatarWrap: { alignItems: 'center', marginTop: -wp(36) },
  avatarRing: {
    padding: wp(4), borderRadius: wp(44), borderWidth: 3,
  },
  profileName: { fontSize: fp(20), fontWeight: '800', textAlign: 'center', marginTop: wp(10) },
  titleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    alignSelf: 'center', paddingHorizontal: wp(10), paddingVertical: wp(3),
    borderRadius: BorderRadius.full, marginTop: wp(6),
  },
  titleBadgeText: { fontSize: fp(11), fontWeight: '600' },
  profileBio: {
    fontSize: FontSize.sm, lineHeight: fp(20), textAlign: 'center',
    marginTop: wp(10), paddingHorizontal: wp(10),
  },
  profileTags: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
    gap: wp(6), marginTop: wp(10),
  },
  profileTag: { paddingHorizontal: wp(10), paddingVertical: wp(4), borderRadius: wp(9999) },
  profileTagText: { fontSize: fp(11) },

  /* 统计 */
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: wp(16), paddingTop: wp(14),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: { alignItems: 'center', minWidth: wp(50) },
  statIconCircle: {
    width: wp(28), height: wp(28), borderRadius: wp(14),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(4),
  },
  statValue: { fontSize: fp(18), fontWeight: '800' },
  statLabel: { fontSize: fp(11), marginTop: wp(2) },

  /* 操作 */
  actionRow: { flexDirection: 'row', gap: wp(10), marginTop: wp(16) },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(5),
    paddingVertical: wp(12), borderRadius: wp(9999), borderWidth: 1,
  },
  followBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
  msgBtn: {
    width: wp(46), height: wp(46), borderRadius: wp(23), borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

  /* 加入时间 */
  joinInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(4), marginTop: wp(12) },
  joinText: { fontSize: fp(11) },

  /* Tab 栏 */
  tabBar: {
    flexDirection: 'row', marginTop: wp(10),
    borderBottomWidth: 1, paddingTop: wp(4),
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: wp(10) },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  tabText: { fontSize: FontSize.md },
  tabLine: { width: wp(20), height: wp(3), borderRadius: wp(2), marginTop: wp(5) },

  /* 作品网格 */
  worksContainer: { paddingHorizontal: PAD, paddingTop: wp(10) },
  worksGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -wp(5) },
  workCol: { width: '50%', paddingHorizontal: wp(5), marginBottom: wp(10) },
  workCard: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  workPreview: { padding: wp(10), alignItems: 'center', justifyContent: 'center', height: wp(120) },
  workInfo: { paddingHorizontal: wp(10), paddingBottom: wp(10) },
  workTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  workStats: { flexDirection: 'row', alignItems: 'center', gap: wp(3), marginTop: wp(4) },
  workStatText: { fontSize: fp(10), marginRight: wp(6) },

  /* 动态列表 */
  feedsContainer: {},
  feedItem: {
    flexDirection: 'row', alignItems: 'center', gap: wp(12),
    paddingHorizontal: PAD, paddingVertical: wp(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  feedContent: { fontSize: FontSize.sm, lineHeight: fp(19) },
  feedMeta: { flexDirection: 'row', alignItems: 'center', gap: wp(10), marginTop: wp(6) },
  feedTime: { fontSize: fp(11) },
  feedStats: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  feedStatText: { fontSize: fp(10), marginRight: wp(6) },
  feedThumb: {
    width: wp(56), height: wp(56), borderRadius: wp(18),
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },

  /* 空状态 */
  emptyTab: { alignItems: 'center', paddingTop: wp(50), paddingHorizontal: wp(40) },
  emptyIcon: {
    width: wp(56), height: wp(56), borderRadius: wp(28),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', marginBottom: wp(4) },
  emptyHint: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: fp(18) },
});
