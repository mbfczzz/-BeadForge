import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, BorderRadius, FontSize } from '../../theme';
import { Avatar, HoverView, BeadGrid, ALL_PATTERNS, PressableScale } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import type { RootScreenProps, RootStackParamList } from '../../navigation/types';
import {
  PROFILE_TABS,
  getCommunityUserData,
  getCommunityUserFeeds,
  getCommunityUserWorks,
} from '../../mock/app';

const PAD = wp(15);

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export const UserProfileScreen: React.FC<RootScreenProps<'UserProfile'>> = ({ route }) => {
  const { userName } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useMemo(() => getCommunityUserData(userName), [userName]);
  const works = useMemo(() => getCommunityUserWorks(userName), [userName]);
  const feeds = useMemo(() => getCommunityUserFeeds(userName), [userName]);

  const [followed, setFollowed] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const gridSize = (screenW - PAD * 2 - wp(10)) / 2;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.topBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={$.navBtn} hoverScale={1.08} hoverLift={0}>
          <MCI name="arrow-left" size={fp(22)} color={colors.text} />
        </HoverView>
        <Text style={[$.topBarTitle, { color: colors.text }]} numberOfLines={1}>{user.name}</Text>
        <HoverView
          onPress={() => Alert.alert('更多', '当前演示环境不接入举报与拉黑能力。')}
          style={$.navBtn}
          hoverScale={1.08}
          hoverLift={0}
        >
          <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
        </HoverView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(30) + BOTTOM_SAFE_H }}>
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

          {user.tags.length > 0 && (
            <View style={$.profileTags}>
              {user.tags.map((tag) => (
                <View key={tag} style={[$.profileTag, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.profileTagText, { color: colors.textHint }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[$.statsRow, { borderTopColor: colors.border }]}>
            {[
              { label: '作品', value: user.posts, icon: 'view-grid-outline' as const, color: '#5B5FFF' },
              { label: '粉丝', value: user.followers, icon: 'account-group-outline' as const, color: '#FF6B6B' },
              { label: '关注', value: user.following, icon: 'account-heart-outline' as const, color: '#F5A623' },
              { label: '获赞', value: user.likes, icon: 'heart-outline' as const, color: '#EF4444' },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={$.statItem}
                onPress={() => {
                  if (item.label === '粉丝' || item.label === '关注') {
                    Alert.alert('提示', '当前演示环境不展示关注关系列表。');
                  }
                }}
              >
                <View style={[$.statIconCircle, { backgroundColor: `${item.color}15` }]}>
                  <MCI name={item.icon} size={fp(14)} color={item.color} />
                </View>
                <Text style={[$.statValue, { color: colors.text }]}>{formatCount(item.value)}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={$.actionRow}>
            <HoverView
              onPress={() => setFollowed((value) => !value)}
              style={[$.followBtn, {
                backgroundColor: followed ? 'transparent' : colors.accent,
                borderColor: followed ? colors.border : colors.accent,
                flex: 1,
              }]}
              hoverScale={1.03}
              hoverLift={0}
            >
              <MCI name={followed ? 'check' : 'plus'} size={fp(16)} color={followed ? colors.textHint : '#fff'} />
              <Text style={[$.followBtnText, { color: followed ? colors.textHint : '#fff' }]}>{followed ? '已关注' : '关注'}</Text>
            </HoverView>
            <HoverView
              onPress={() => Alert.alert('私信', '当前演示环境不接入私信。')}
              style={[$.iconAction, { borderColor: colors.border }]}
              hoverScale={1.03}
              hoverLift={0}
            >
              <MCI name="chat-outline" size={fp(18)} color={colors.text} />
            </HoverView>
            <HoverView
              onPress={() => Alert.alert('分享', '当前演示环境不接入系统分享。')}
              style={[$.iconAction, { borderColor: colors.border }]}
              hoverScale={1.03}
              hoverLift={0}
            >
              <MCI name="share-outline" size={fp(18)} color={colors.text} />
            </HoverView>
          </View>

          <View style={$.joinInfo}>
            <MCI name="calendar-outline" size={fp(13)} color={colors.textHint} />
            <Text style={[$.joinText, { color: colors.textHint }]}>{user.joinDate} 加入</Text>
          </View>
        </View>

        <View style={[$.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {PROFILE_TABS.map((tab, index) => {
            const active = index === tabIndex;
            return (
              <HoverView key={tab.label} onPress={() => setTabIndex(index)} style={$.tabItem} hoverScale={1.02} hoverLift={0}>
                <View style={$.tabContent}>
                  <MCI name={active ? tab.iconActive : tab.icon} size={fp(16)} color={active ? colors.accent : colors.textHint} />
                  <Text style={[$.tabText, { color: active ? colors.text : colors.textHint }, active && { fontWeight: '700' }]}>{tab.label}</Text>
                </View>
                {active && <View style={[$.tabLine, { backgroundColor: colors.accent }]} />}
              </HoverView>
            );
          })}
        </View>

        {tabIndex === 0 && (
          <View style={$.worksContainer}>
            {works.length === 0 ? (
              <EmptyTab icon="view-grid-outline" text="还没有作品" hint="作品会在这里集中展示" colors={colors} />
            ) : (
              <View style={$.worksGrid}>
                {works.map((work, index) => {
                  const pattern = ALL_PATTERNS[work.patternIdx % ALL_PATTERNS.length];
                  const beadSize = Math.max(Math.floor((gridSize - wp(18)) / (pattern[0]?.length || 9)) - 1, 6);

                  return (
                    <PressableScale
                      key={`${user.name}-${index}`}
                      scale={0.97}
                      style={{ width: gridSize }}
                      onPress={() => navigation.navigate('Editor', { mode: 'manual', cols: pattern[0]?.length || 9, rows: pattern.length })}
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
                            <MCI name="comment-outline" size={fp(12)} color={colors.textHint} />
                            <Text style={[$.workStatText, { color: colors.textHint }]}>{work.commentCount}</Text>
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
          <View style={$.feedList}>
            {feeds.length === 0 ? (
              <EmptyTab icon="text-box-outline" text="还没有动态" hint="作者发布的动态会出现在这里" colors={colors} />
            ) : (
              feeds.map((feed) => (
                <PressableScale key={feed.id} scale={0.985} style={[$.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('FeedDetail', { feed })}>
                  <View style={$.feedCardHeader}>
                    <Avatar name={feed.user.name} size={wp(36)} />
                    <View style={{ flex: 1, marginLeft: wp(10) }}>
                      <Text style={[$.feedCardName, { color: colors.text }]}>{feed.user.name}</Text>
                      <Text style={[$.feedCardMeta, { color: colors.textHint }]}>{feed.timeAgo}</Text>
                    </View>
                  </View>
                  <Text style={[$.feedCardContent, { color: colors.textSecondary }]}>{feed.content}</Text>
                  <View style={$.feedTagWrap}>
                    {feed.tags.map((tag) => (
                      <View key={`${feed.id}-${tag}`} style={[$.profileTag, { backgroundColor: colors.inputBg }]}>
                        <Text style={[$.profileTagText, { color: colors.textHint }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </PressableScale>
              ))
            )}
          </View>
        )}

        {tabIndex === 2 && (
          <EmptyTab icon="heart-outline" text="还没有公开喜欢内容" hint="这里通常会展示作者收藏或点赞的作品" colors={colors} />
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
  headerBg: {
    height: wp(82),
    marginHorizontal: PAD,
    marginTop: wp(12),
    borderRadius: wp(24),
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    right: -wp(24),
    top: -wp(20),
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileCard: {
    marginHorizontal: PAD,
    marginTop: -wp(34),
    borderRadius: wp(20),
    paddingHorizontal: wp(16),
    paddingBottom: wp(18),
  },
  avatarWrap: { alignItems: 'center', marginTop: -wp(28) },
  avatarRing: {
    borderWidth: 4,
    borderRadius: wp(40),
    padding: wp(4),
  },
  profileName: { textAlign: 'center', fontSize: fp(19), fontWeight: '800', marginTop: wp(10) },
  titleBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
    borderRadius: wp(999),
    marginTop: wp(8),
  },
  titleBadgeText: { fontSize: fp(11), fontWeight: '700' },
  profileBio: { marginTop: wp(12), fontSize: fp(13), lineHeight: fp(19), textAlign: 'center' },
  profileTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(8), marginTop: wp(12) },
  profileTag: { paddingHorizontal: wp(10), paddingVertical: wp(6), borderRadius: wp(12) },
  profileTagText: { fontSize: fp(11) },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: wp(18),
    paddingTop: wp(16),
    borderTopWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIconCircle: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(6),
  },
  statValue: { fontSize: fp(15), fontWeight: '800' },
  statLabel: { marginTop: wp(3), fontSize: fp(11) },
  actionRow: { flexDirection: 'row', gap: wp(10), marginTop: wp(18) },
  followBtn: {
    height: wp(40),
    borderRadius: wp(14),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
  },
  followBtnText: { fontSize: fp(13), fontWeight: '700' },
  iconAction: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(14),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6), marginTop: wp(14) },
  joinText: { fontSize: fp(11) },
  tabBar: {
    flexDirection: 'row',
    marginTop: wp(14),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: wp(12) },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: wp(5) },
  tabText: { fontSize: fp(12) },
  tabLine: { marginTop: wp(8), height: wp(3), width: wp(18), borderRadius: wp(2) },
  worksContainer: { paddingHorizontal: PAD, paddingTop: wp(14) },
  worksGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: wp(10) },
  workCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  workPreview: {
    height: wp(148),
    justifyContent: 'center',
    alignItems: 'center',
  },
  workInfo: { padding: wp(10) },
  workTitle: { fontSize: FontSize.md, fontWeight: '600' },
  workStats: { flexDirection: 'row', alignItems: 'center', gap: wp(5), marginTop: wp(8) },
  workStatText: { fontSize: fp(11) },
  feedList: { paddingHorizontal: PAD, paddingTop: wp(14), gap: wp(10) },
  feedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: wp(14),
  },
  feedCardHeader: { flexDirection: 'row', alignItems: 'center' },
  feedCardName: { fontSize: fp(13), fontWeight: '700' },
  feedCardMeta: { fontSize: fp(11), marginTop: wp(2) },
  feedCardContent: { marginTop: wp(10), fontSize: fp(13), lineHeight: fp(18) },
  feedTagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginTop: wp(10) },
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
});
