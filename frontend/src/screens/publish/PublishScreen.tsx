import React, { useState, memo, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert,
  TextInput, RefreshControl, Animated, NativeSyntheticEvent, NativeScrollEvent,
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
import { hapticLight } from '../../hooks/useFeedback';
import { feedApi, toFeedItem } from '../../api/feed';
import type { RootStackParamList, FeedItemData } from '../../navigation/types';

const PAD = wp(15);

/* ──────────────── 展示装饰数据（与动态流无关） ──────────────── */

// 热门话题
const HOT_TOPICS = [
  { tag: '春日手作', count: '1.2w' },
  { tag: 'AI创作挑战', count: '8.6k' },
  { tag: '新手打卡', count: '5.3k' },
  { tag: '迷你珠饰品', count: '3.8k' },
];

// 活跃用户 Stories — 渐变色环
const STORY_USERS = [
  { name: '小豆子', hasNew: true, ring: ['#FF6B6B', '#FF8E53'] },
  { name: '像素艺术家', hasNew: true, ring: ['#5B5FFF', '#C084FC'] },
  { name: '彩虹桥', hasNew: true, ring: ['#F5A623', '#FF6B6B'] },
  { name: '拼豆小屋', hasNew: false, ring: ['#ccc', '#ddd'] },
  { name: '花花世界', hasNew: false, ring: ['#ccc', '#ddd'] },
  { name: '游戏迷', hasNew: true, ring: ['#20C997', '#38D9A9'] },
  { name: '钻石控', hasNew: false, ring: ['#ccc', '#ddd'] },
];

const TABS = ['推荐', '关注', '最新'];

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ──────────────── 主屏幕 ──────────────── */

export const PublishScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tabIdx, setTabIdx] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;

  const [feeds, setFeeds] = useState<FeedItemData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchFeeds = useCallback(async () => {
    setRefreshing(true);
    setLoadError(null);
    try {
      const isFollowing = tabIdx === 1;
      const res = isFollowing
        ? await feedApi.following({ page: 1, size: 20 })
        : await feedApi.list({ page: 1, size: 20, tab: tabIdx === 2 ? 'latest' : 'recommend' });
      setFeeds((res.data?.records || []).map(toFeedItem));
    } catch (e: any) {
      setLoadError(e?.message || '加载失败');
      // 关注 Tab 未登录会 401；保留空列表，下面空态会提示
      if (tabIdx === 1) setFeeds([]);
    } finally {
      setRefreshing(false);
    }
  }, [tabIdx]);

  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  const filteredFeeds = useMemo(() => {
    let list = feeds;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((f) =>
        f.content.toLowerCase().includes(q) ||
        f.user.name.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [feeds, searchText]);

  const onRefresh = useCallback(() => { fetchFeeds(); }, [fetchFeeds]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const shouldShow = y > 300;
    setShowTop(shouldShow);
    Animated.timing(fabAnim, { toValue: shouldShow ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, []);

  const onTagPress = useCallback((tag: string) => {
    setShowSearch(true);
    setSearchText(tag);
  }, []);

  const handlePublish = () => {
    Alert.alert('发布动态', '选择发布方式', [
      { text: '图文动态', onPress: () => Alert.alert('提示', '图文发布功能即将上线~') },
      { text: '分享作品', onPress: () => Alert.alert('提示', '可以在「创作」中完成作品后直接分享到动态哦~') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* ═══ 顶栏 ═══ */}
      <View style={[$.header, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[$.headerTitle, { color: colors.text, letterSpacing: -0.3 }]}>动态</Text>
        <View style={$.tabRow}>
          {TABS.map((t, i) => {
            const active = i === tabIdx;
            return (
              <HoverView
                key={t}
                onPress={() => setTabIdx(i)}
                style={[$.tab]}
                hoverScale={1.05} hoverLift={0}
              >
                <Text style={[
                  $.tabText,
                  { color: active ? colors.text : colors.textHint },
                  active && { fontWeight: '700' },
                ]}>{t}</Text>
                {active && <View style={[$.tabIndicator, { backgroundColor: colors.accent }]} />}
              </HoverView>
            );
          })}
        </View>
        <HoverView onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearchText(''); }} style={[$.iconBtn, { backgroundColor: showSearch ? colors.accentLight : colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <MCI name={showSearch ? 'close' : 'magnify'} size={fp(18)} color={showSearch ? colors.accent : colors.textHint} />
        </HoverView>
      </View>

      {/* ═══ 搜索栏 ═══ */}
      {showSearch && (
        <View style={[$.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[$.searchInputWrap, { backgroundColor: colors.inputBg, borderColor: searchText ? colors.accent + '40' : 'transparent' }]}>
            <MCI name="magnify" size={fp(16)} color={colors.textHint} />
            <TextInput
              style={[$.searchInput, { color: colors.text }]}
              placeholder="搜索动态、用户、标签..."
              placeholderTextColor={colors.textHint}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <HoverView onPress={() => setSearchText('')} hoverScale={1.1} hoverLift={0}>
                <MCI name="close-circle" size={fp(16)} color={colors.textHint} />
              </HoverView>
            )}
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(80) + BOTTOM_SAFE_H }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        onScroll={onScroll}
        scrollEventThrottle={64}
      >
        {/* ═══ Stories 用户行 ═══ */}
        {!showSearch && tabIdx !== 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={$.storyRow}
            style={[$.storyContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          >
            {/* 我的动态入口 */}
            <Pressable onPress={handlePublish} style={$.storyItem}>
              <View style={[$.storyRingOuter, { borderColor: colors.border }]}>
                <View style={[$.storyAddCircle, { backgroundColor: colors.inputBg }]}>
                  <MCI name="plus" size={fp(22)} color={colors.accent} />
                </View>
              </View>
              <Text style={[$.storyName, { color: colors.textHint }]}>发动态</Text>
            </Pressable>
            {STORY_USERS.map((u) => (
              <Pressable
                key={u.name}
                onPress={() => navigation.navigate('UserProfile', { userName: u.name })}
                style={$.storyItem}
              >
                <View style={[$.storyRingOuter, { borderColor: u.hasNew ? u.ring[0] : colors.border }]}>
                  <Avatar name={u.name} size={wp(46)} />
                </View>
                {u.hasNew && <View style={[$.storyDot, { backgroundColor: u.ring[0], borderColor: colors.surface }]} />}
                <Text style={[$.storyName, { color: colors.text }]} numberOfLines={1}>{u.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ═══ 热门话题 ═══ */}
        {!showSearch && tabIdx === 0 && (
          <View style={[$.topicsSection, { backgroundColor: colors.surface }]}>
            <View style={$.topicsHeader}>
              <View style={[$.topicsIconCircle, { backgroundColor: '#FFF0E6' }]}>
                <MCI name="fire" size={fp(14)} color="#FF6B35" />
              </View>
              <Text style={[$.topicsTitle, { color: colors.text }]}>热门话题</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={$.topicsPills}>
              {HOT_TOPICS.map((t) => (
                <HoverView
                  key={t.tag}
                  onPress={() => { setShowSearch(true); setSearchText(t.tag); }}
                  style={[$.topicPill, { backgroundColor: colors.accentLight, borderColor: colors.accent + '20' }]}
                  hoverScale={1.04} hoverLift={0}
                >
                  <Text style={[$.topicTag, { color: colors.accent }]}>#{t.tag}</Text>
                  <Text style={[$.topicCount, { color: colors.accent + 'AA' }]}>{t.count}</Text>
                </HoverView>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ═══ Feed 列表 ═══ */}
        {filteredFeeds.length === 0 ? (
          <View style={$.emptyState}>
            <View style={[$.emptyIcon, { backgroundColor: colors.inputBg }]}>
              <MCI name={searchText ? 'text-search' : tabIdx === 1 ? 'account-group-outline' : 'tray-alert'} size={fp(30)} color={colors.textHint} />
            </View>
            <Text style={[$.emptyTitle, { color: colors.text }]}>
              {searchText ? '没有找到相关动态' : tabIdx === 1 ? '还没有关注的人' : '暂无动态'}
            </Text>
            <Text style={[$.emptyHint, { color: colors.textHint }]}>
              {searchText ? '换个关键词试试~' : tabIdx === 1 ? '去「推荐」页关注感兴趣的创作者吧' : '下拉刷新试试看~'}
            </Text>
          </View>
        ) : (
          filteredFeeds.map((feed, idx) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              colors={colors}
              dark={dark}
              isFirst={idx === 0}
              navigation={navigation}
              onTagPress={onTagPress}
            />
          ))
        )}
      </ScrollView>

      {/* ═══ 发布 FAB ═══ */}
      <HoverView
        onPress={handlePublish}
        style={[$.fab, { backgroundColor: colors.accent }]}
        hoverScale={1.1}
        hoverLift={3}
      >
        <MCI name="pencil-plus-outline" size={fp(22)} color="#fff" />
      </HoverView>

      {/* ═══ 回顶部 ═══ */}
      {showTop && (
        <Animated.View style={[$.topFab, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: fabAnim,
          transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <HoverView onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} hoverScale={1.1} hoverLift={0} style={$.topFabInner}>
            <MCI name="arrow-up" size={fp(18)} color={colors.textHint} />
          </HoverView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

/* ──────────────── 动态卡片 ──────────────── */

const FeedCard: React.FC<{
  feed: FeedItemData; colors: ThemeColors; dark: boolean; isFirst: boolean;
  navigation: any; onTagPress: (tag: string) => void;
}> = memo(({ feed, colors, dark, isFirst, navigation, onTagPress }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const pat = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const previewW = screenW - PAD * 2 - wp(24);
  const bs = Math.floor(previewW / (pat[0]?.length || 9)) - 1;

  const handleLike = () => {
    hapticLight();
    setLiked(!liked);
    if (!liked) {
      Animated.sequence([
        Animated.timing(likeAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
        Animated.timing(likeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleShare = () => {
    hapticLight();
    // 视觉反馈由 haptic 提供，不阻塞用户
  };

  const handleBookmark = () => {
    hapticLight();
    setBookmarked(!bookmarked);
  };

  return (
    <PressableScale onPress={() => navigation.navigate('FeedDetail', { feed })} scale={0.985}>
      <View style={[
        $.feedCard,
        { backgroundColor: colors.surface },
        !isFirst && { marginTop: wp(8) },
        { borderRadius: BorderRadius.lg, marginHorizontal: PAD, borderWidth: 1, borderColor: colors.border },
      ]}>
        {/* 用户头部 */}
        <View style={$.feedHeader}>
          <Pressable onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })} style={$.feedUserRow}>
            <Avatar name={feed.user.name} size={wp(40)} />
            <View style={{ flex: 1, marginLeft: wp(10) }}>
              <Text style={[$.feedUserName, { color: colors.text }]}>{feed.user.name}</Text>
              <View style={$.feedMetaRow}>
                <View style={[$.levelBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[$.levelText, { color: colors.accent }]}>{feed.user.title}</Text>
                </View>
                <Text style={[$.feedTime, { color: colors.textHint }]}>{feed.timeAgo}</Text>
              </View>
            </View>
          </Pressable>
          <HoverView
            onPress={() => setFollowed(!followed)}
            style={[$.feedFollowBtn, {
              borderColor: followed ? colors.border : colors.accent,
              backgroundColor: followed ? colors.inputBg : colors.accent + '10',
            }]}
            hoverScale={1.05} hoverLift={0}
          >
            {followed ? (
              <MCI name="check" size={fp(14)} color={colors.textHint} />
            ) : (
              <MCI name="plus" size={fp(14)} color={colors.accent} />
            )}
            <Text style={[$.feedFollowText, { color: followed ? colors.textHint : colors.accent }]}>
              {followed ? '已关注' : '关注'}
            </Text>
          </HoverView>
        </View>

        {/* 内容 */}
        <Text style={[$.feedContent, { color: colors.text }]} numberOfLines={4}>{feed.content}</Text>

        {/* 标签 */}
        <View style={$.feedTags}>
          {feed.tags.map((tag) => (
            <Pressable key={tag} onPress={() => onTagPress(tag)}>
              <View style={[$.feedTag, { backgroundColor: colors.accentLight }]}>
                <Text style={[$.feedTagText, { color: colors.accent }]}>#{tag}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* 图案预览 */}
        <View style={[$.feedPreview, { backgroundColor: dark ? '#222' : '#f8f8fa', borderColor: dark ? '#333' : '#eee' }]}>
          <BeadGrid pixels={pat} beadSize={Math.min(bs, wp(18))} gap={1} round />
          <Pressable
            onPress={() => navigation.navigate('Editor', { mode: 'manual', cols: pat[0]?.length || 9, rows: pat.length })}
            style={[$.makeBtn, { backgroundColor: colors.accent }]}
          >
            <MCI name="palette-outline" size={fp(12)} color="#fff" />
            <Text style={$.makeBtnText}>制作</Text>
          </Pressable>
        </View>

        {/* 互动栏 */}
        <View style={[$.feedActions, { borderTopColor: colors.border }]}>
          <Pressable style={$.feedActionBtn} onPress={(e) => { e.stopPropagation?.(); handleLike(); }}>
            <Animated.View style={[$.feedActionCircle, { backgroundColor: liked ? '#FEE2E2' : dark ? '#2a2226' : '#faf5f5', transform: [{ scale: likeAnim }] }]}>
              <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(16)} color={liked ? '#EF4444' : '#E8A0A0'} />
            </Animated.View>
            <Text style={[$.feedActionLabel, { color: liked ? '#EF4444' : colors.textHint }]}>
              {formatCount(liked ? feed.likeCount + 1 : feed.likeCount)}
            </Text>
          </Pressable>
          <Pressable style={$.feedActionBtn} onPress={() => navigation.navigate('FeedDetail', { feed })}>
            <View style={[$.feedActionCircle, { backgroundColor: dark ? '#1e2530' : '#f0f4ff' }]}>
              <MCI name="comment-outline" size={fp(16)} color={dark ? '#7B9FD4' : '#8BA4D0'} />
            </View>
            <Text style={[$.feedActionLabel, { color: colors.textHint }]}>{formatCount(feed.commentCount)}</Text>
          </Pressable>
          <Pressable style={$.feedActionBtn} onPress={(e) => { e.stopPropagation?.(); handleShare(); }}>
            <View style={[$.feedActionCircle, { backgroundColor: dark ? '#1e2e28' : '#f0faf5' }]}>
              <MCI name="share-outline" size={fp(16)} color={dark ? '#6DC4A0' : '#6BB89D'} />
            </View>
            <Text style={[$.feedActionLabel, { color: colors.textHint }]}>{formatCount(feed.shareCount)}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={$.feedActionBtn} onPress={(e) => { e.stopPropagation?.(); handleBookmark(); }}>
            <View style={[$.feedActionCircle, { backgroundColor: bookmarked ? colors.accentLight : dark ? '#22222e' : '#f5f3ff' }]}>
              <MCI name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={fp(16)} color={bookmarked ? colors.accent : dark ? '#9B8FCF' : '#A99BD4'} />
            </View>
          </Pressable>
        </View>
      </View>
    </PressableScale>
  );
});

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  /* 顶栏 */
  header: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD, borderBottomWidth: 1,
    gap: wp(6),
  },
  headerTitle: { fontSize: fp(20), fontWeight: '800', marginRight: wp(6) },
  tabRow: { flex: 1, flexDirection: 'row', gap: wp(2) },
  tab: { paddingHorizontal: wp(10), paddingVertical: wp(6), alignItems: 'center' },
  tabText: { fontSize: FontSize.md },
  tabIndicator: {
    width: wp(16), height: wp(3), borderRadius: wp(2),
    marginTop: wp(3),
  },
  iconBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },

  /* 搜索栏 */
  searchBar: {
    paddingHorizontal: PAD, paddingVertical: wp(8),
    borderBottomWidth: 1,
  },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    paddingHorizontal: wp(12), borderRadius: BorderRadius.md, borderWidth: 1,
    height: wp(36),
  },
  searchInput: {
    flex: 1, fontSize: FontSize.sm, padding: 0,
  },

  /* Stories */
  storyContainer: { borderBottomWidth: 1 },
  storyRow: { paddingHorizontal: PAD, paddingVertical: wp(12), gap: wp(12) },
  storyItem: { alignItems: 'center', width: wp(60) },
  storyRingOuter: {
    padding: wp(2.5), borderRadius: wp(28), borderWidth: 2.5,
  },
  storyAddCircle: {
    width: wp(46), height: wp(46), borderRadius: wp(23),
    justifyContent: 'center', alignItems: 'center',
  },
  storyDot: {
    position: 'absolute', top: wp(2), right: wp(6),
    width: wp(10), height: wp(10), borderRadius: wp(5),
    borderWidth: 2,
  },
  storyName: { fontSize: fp(10), marginTop: wp(4), textAlign: 'center' },

  /* 热门话题 */
  topicsSection: { paddingVertical: wp(10) },
  topicsIconCircle: {
    width: wp(22), height: wp(22), borderRadius: wp(11),
    justifyContent: 'center', alignItems: 'center',
  },
  topicsHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(6), paddingHorizontal: PAD, marginBottom: wp(8) },
  topicsTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  topicsPills: { paddingHorizontal: PAD, gap: wp(8) },
  topicPill: {
    flexDirection: 'row', alignItems: 'center', gap: wp(5),
    paddingHorizontal: wp(12), paddingVertical: wp(6),
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  topicTag: { fontSize: fp(12), fontWeight: '600' },
  topicCount: { fontSize: fp(10) },

  /* 空状态 */
  emptyState: { alignItems: 'center', paddingTop: wp(60), paddingHorizontal: wp(40) },
  emptyIcon: {
    width: wp(64), height: wp(64), borderRadius: wp(32),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(14),
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', marginBottom: wp(6) },
  emptyHint: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: fp(19) },

  /* 动态卡片 */
  feedCard: {
    paddingHorizontal: wp(14), paddingTop: wp(14), paddingBottom: wp(4),
    overflow: 'hidden',
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center' },
  feedUserRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  feedUserName: { fontSize: FontSize.md, fontWeight: '600' },
  feedMetaRow: { flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(3) },
  levelBadge: { paddingHorizontal: wp(6), paddingVertical: wp(1), borderRadius: wp(3) },
  levelText: { fontSize: fp(10), fontWeight: '500' },
  feedTime: { fontSize: fp(11) },
  feedFollowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(3),
    paddingHorizontal: wp(10), paddingVertical: wp(5),
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  feedFollowText: { fontSize: fp(11), fontWeight: '600' },
  feedContent: {
    fontSize: FontSize.md, lineHeight: fp(22),
    marginTop: wp(10),
  },
  feedTags: {
    flexDirection: 'row', flexWrap: 'wrap', gap: wp(6),
    marginTop: wp(8),
  },
  feedTag: {
    paddingHorizontal: wp(8), paddingVertical: wp(3),
    borderRadius: wp(4),
  },
  feedTagText: { fontSize: fp(11), fontWeight: '500' },
  feedPreview: {
    marginTop: wp(10), borderRadius: BorderRadius.md,
    padding: wp(12), alignItems: 'center',
    borderWidth: 1,
  },
  makeBtn: {
    position: 'absolute', bottom: wp(8), right: wp(8),
    flexDirection: 'row', alignItems: 'center', gap: wp(3),
    paddingHorizontal: wp(10), paddingVertical: wp(5),
    borderRadius: BorderRadius.full,
  },
  makeBtnText: { fontSize: fp(11), fontWeight: '600', color: '#fff' },
  feedActions: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: wp(8), paddingTop: wp(8), borderTopWidth: StyleSheet.hairlineWidth,
  },
  feedActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(5),
    paddingHorizontal: wp(6), paddingVertical: wp(6),
  },
  feedActionCircle: {
    width: wp(30), height: wp(30), borderRadius: wp(15),
    justifyContent: 'center', alignItems: 'center',
  },
  feedActionLabel: { fontSize: FontSize.xs, fontWeight: '500' },

  /* FAB */
  fab: {
    position: 'absolute', right: wp(18), bottom: wp(22) + BOTTOM_SAFE_H,
    width: wp(52), height: wp(52), borderRadius: wp(26),
    justifyContent: 'center', alignItems: 'center',
  },
  topFab: {
    position: 'absolute', right: wp(18), bottom: wp(82) + BOTTOM_SAFE_H,
    width: wp(38), height: wp(38), borderRadius: wp(19),
    borderWidth: 1,
    ...shadow(1, 4, 0.08, '#000', 2),
  },
  topFabInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
