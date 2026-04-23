import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, FilterChip, HoverView, Input, PressableScale } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import type { RootStackParamList, FeedItemData } from '../../navigation/types';
import { ALL_FEEDS, COMMUNITY_TABS } from '../../mock/community';
import { getFeedMockMedia } from '../../utils/feedMedia';
import { shadow } from '../../utils/shadow';

const PAD = wp(18);
const PREVIEW_WIDTH = screenW - PAD * 2 - wp(28);
const TAG_COLORS = ['accent', 'default', 'success', 'warning'] as const;

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function rotateFeeds(feeds: FeedItemData[], step: number) {
  if (feeds.length <= 1) return feeds;
  const offset = step % feeds.length;
  if (offset === 0) return feeds;
  return [...feeds.slice(offset), ...feeds.slice(0, offset)];
}

export const PublishScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tabIdx, setTabIdx] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshRound, setRefreshRound] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const topAnim = useRef(new Animated.Value(0)).current;

  const baseFeeds = useMemo(() => {
    const rotated = rotateFeeds(ALL_FEEDS, refreshRound);
    return rotated.map((feed, index) => ({
      ...feed,
      likeCount: feed.likeCount + ((refreshRound + index) % 3 === 0 ? refreshRound % 4 : 0),
      commentCount: feed.commentCount + ((refreshRound + index) % 5 === 0 ? 1 : 0),
      shareCount: feed.shareCount + ((refreshRound + index) % 4 === 0 ? 1 : 0),
      timeAgo: refreshRound > 0 && index < 2 ? '刚刚' : feed.timeAgo,
    }));
  }, [refreshRound]);

  const filteredFeeds = useMemo(() => {
    let feeds = [...baseFeeds];

    if (tabIdx === 1) {
      feeds = feeds.filter((feed) => ['木木手作', '饰品工作室', '拼豆小屋'].includes(feed.user.name));
    } else if (tabIdx === 2) {
      feeds.sort((a, b) => b.id - a.id);
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      feeds = feeds.filter((feed) =>
        feed.content.toLowerCase().includes(keyword)
        || feed.user.name.toLowerCase().includes(keyword)
        || feed.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    return feeds;
  }, [baseFeeds, searchText, tabIdx]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRefreshRound((value) => value + 1);
    setRefreshing(false);
  }, [refreshing]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldShow = e.nativeEvent.contentOffset.y > 320;
    setShowTop((current) => {
      if (current === shouldShow) return current;
      Animated.timing(topAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return shouldShow;
    });
  }, [topAnim]);

  const onTagPress = useCallback((tag: string) => {
    setShowSearch(true);
    setSearchText(tag);
  }, []);

  const handlePublish = useCallback(() => {
    Alert.alert('发布动态', '当前演示环境只展示 mock 数据，暂不接入真实发布能力。');
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {COMMUNITY_TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.82}
                onPress={() => setTabIdx(index)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: index === tabIdx ? colors.accent : colors.surface,
                    borderColor: index === tabIdx ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabPillText, { color: index === tabIdx ? '#FFFFFF' : colors.textSecondary }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => {
              setShowSearch((value) => !value);
              if (showSearch) setSearchText('');
            }}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MCI name={showSearch ? 'close' : 'account-plus-outline'} size={fp(18)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch ? (
        <View style={styles.searchBar}>
          <Input
            placeholder="搜索动态、作者或标签"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            prefix={<MCI name="magnify" size={fp(16)} color={searchFocused ? colors.accent : colors.textHint} />}
            autoFocus
            containerStyle={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.border }]}
            style={searchFocused ? { borderColor: colors.accent, backgroundColor: colors.surface } : undefined}
          />
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        onScroll={onScroll}
        scrollEventThrottle={64}
      >
        {filteredFeeds.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <MCI name={searchText ? 'text-search' : 'tray-alert'} size={fp(30)} color={colors.textHint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{searchText ? '没有找到相关动态' : '暂无动态'}</Text>
            <Text style={[styles.emptyHint, { color: colors.textHint }]}>{searchText ? '换个关键词试试' : '下拉刷新后再看看'}</Text>
          </View>
        ) : (
          filteredFeeds.map((feed, index) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              colors={colors}
              navigation={navigation}
              onTagPress={onTagPress}
              isFirst={index === 0}
              isFresh={refreshRound > 0 && index < 2}
            />
          ))
        )}
      </ScrollView>

      <HoverView onPress={handlePublish} style={[styles.fab, { backgroundColor: colors.accent }]} hoverScale={1.06} hoverLift={3}>
        <MCI name="pencil-plus-outline" size={fp(22)} color="#FFFFFF" />
      </HoverView>

      {showTop ? (
        <Animated.View
          style={[
            styles.topFab,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: topAnim,
              transform: [{ translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <HoverView onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} hoverScale={1.08} hoverLift={0} style={styles.topFabInner}>
            <MCI name="arrow-up" size={fp(18)} color={colors.textHint} />
          </HoverView>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};

const FeedCard: React.FC<{
  feed: FeedItemData;
  colors: ThemeColors;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onTagPress: (tag: string) => void;
  isFirst: boolean;
  isFresh: boolean;
}> = memo(({ feed, colors, navigation, onTagPress, isFirst, isFresh }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const media = useMemo(() => getFeedMockMedia(feed), [feed]);
  const previewHeight = PREVIEW_WIDTH / media.aspectRatio;

  return (
    <PressableScale
      scale={0.99}
      style={{ marginHorizontal: PAD, marginTop: isFirst ? wp(12) : wp(10) }}
      onPress={() => navigation.navigate('FeedDetail', { feed })}
      dataClass="card"
    >
      <View style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.feedHeader}>
          <Pressable style={styles.feedUserRow} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
            <Avatar name={feed.user.name} size={wp(42)} />
            <View style={styles.feedUserInfo}>
              <Text style={[styles.feedUserName, { color: colors.text }]}>{feed.user.name}</Text>
              <Text style={[styles.feedUserTitle, { color: colors.textHint }]}>{feed.timeAgo}</Text>
            </View>
          </Pressable>
          <MCI name="dots-horizontal" size={fp(20)} color={colors.textHint} />
        </View>

        <View style={styles.feedBody}>
          <Text style={[styles.feedContent, { color: colors.textSecondary }]}>{feed.content}</Text>
          {feed.caption ? <Text style={[styles.feedCaption, { color: colors.textHint }]}>{feed.caption}</Text> : null}

          <View style={styles.tagWrap}>
            {feed.tags.map((tag, index) => (
              <FilterChip
                key={`${feed.id}-${tag}`}
                label={`#${tag}`}
                active
                color={TAG_COLORS[index % TAG_COLORS.length]}
                onPress={() => onTagPress(tag)}
                style={styles.tagChip}
              />
            ))}
          </View>

          <View style={[styles.mediaWrap, { height: previewHeight, borderColor: colors.divider }]}>
            <SvgXml xml={media.svg} width={PREVIEW_WIDTH} height={previewHeight} />
            <View style={styles.mediaOverlayTop}>
              <View style={styles.mediaBadgeGroup}>
                {isFresh ? <FilterChip label="刚刚更新" active color="accent" /> : null}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.actionRow, { borderTopColor: colors.divider }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setLiked((value) => !value)} style={styles.actionItem}>
            <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(18)} color={liked ? '#FF5E73' : colors.textHint} />
            <Text style={[styles.actionText, { color: colors.textHint }]}>{formatCount(feed.likeCount + (liked ? 1 : 0))}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionItem}>
            <MCI name="message-outline" size={fp(18)} color={colors.textHint} />
            <Text style={[styles.actionText, { color: colors.textHint }]}>{formatCount(feed.commentCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setSaved((value) => !value)} style={styles.actionItem}>
            <MCI name={saved ? 'bookmark' : 'bookmark-outline'} size={fp(18)} color={saved ? colors.accent : colors.textHint} />
            <Text style={[styles.actionText, { color: colors.textHint }]}>收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionItem}>
            <MCI name="share-outline" size={fp(18)} color={colors.textHint} />
            <Text style={[styles.actionText, { color: colors.textHint }]}>分享</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: PAD,
    paddingTop: wp(8),
    paddingBottom: wp(12),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  iconButton: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    gap: wp(10),
    paddingRight: wp(6),
  },
  tabPill: {
    minHeight: wp(34),
    paddingHorizontal: wp(16),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  searchBar: {
    paddingHorizontal: PAD,
    paddingBottom: wp(8),
  },
  searchField: {
    borderWidth: 1,
    borderRadius: wp(999),
  },
  content: {
    paddingBottom: wp(90) + BOTTOM_SAFE_H,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PAD,
    paddingTop: wp(80),
  },
  emptyIcon: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(16),
  },
  emptyTitle: {
    fontSize: fp(16),
    fontWeight: '800',
  },
  emptyHint: {
    marginTop: wp(6),
    fontSize: fp(12),
  },
  feedCard: {
    borderWidth: 1,
    borderRadius: wp(24),
    overflow: 'hidden',
    ...shadow(10, 26, 0.06, '#1D3D6B', 6),
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingTop: wp(16),
  },
  feedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feedUserInfo: {
    marginLeft: wp(12),
    flex: 1,
  },
  feedUserName: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  feedUserTitle: {
    marginTop: wp(3),
    fontSize: fp(11),
  },
  feedBody: {
    paddingHorizontal: wp(16),
    paddingTop: wp(12),
    paddingBottom: wp(14),
    gap: wp(12),
  },
  feedContent: {
    fontSize: fp(14),
    lineHeight: fp(22),
  },
  feedCaption: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
  },
  tagChip: {
    marginRight: 0,
  },
  mediaWrap: {
    overflow: 'hidden',
    borderRadius: wp(20),
    borderWidth: 1,
    position: 'relative',
  },
  mediaOverlayTop: {
    position: 'absolute',
    top: wp(10),
    left: wp(10),
    right: wp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mediaBadgeGroup: {
    flexDirection: 'row',
    gap: wp(6),
  },
  actionRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(10),
    paddingVertical: wp(10),
  },
  actionItem: {
    minWidth: wp(58),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
  },
  actionText: {
    fontSize: fp(11),
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: PAD,
    bottom: wp(104),
    width: wp(56),
    height: wp(56),
    borderRadius: wp(28),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(12, 24, 0.18, '#4A90FF', 10),
  },
  topFab: {
    position: 'absolute',
    right: PAD,
    bottom: wp(172),
    width: wp(46),
    height: wp(46),
    borderRadius: wp(23),
    borderWidth: 1,
    ...shadow(8, 20, 0.08, '#1D3D6B', 5),
  },
  topFabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
