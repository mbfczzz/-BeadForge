import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  Animated,
  Image,
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
import type { RootStackParamList } from '../../navigation/types';
import { COMMUNITY_TABS } from '../../mock/community';
import { feedApi, likeApi, type FeedItemData } from '../../api/community';
import { useAuthStore } from '../../store/useAuthStore';
import { getFeedMockGallery } from '../../utils/feedMedia';
import { shadow } from '../../utils/shadow';
import { FeedMediaViewer } from '../../components/community/FeedMediaViewer';
import { useCommunityFeedStore } from '../../store/useCommunityFeedStore';

const COMMUNITY_BLUE = '#3B82F6';
const COMMUNITY_ROSE = '#E11D48';
const PAD = wp(14);
const PREVIEW_WIDTH = screenW - PAD * 2;
const TAG_COLORS = ['accent', 'default', 'success', 'warning'] as const;

function formatCount(value: number) {
  if (value >= 10000) {
    const next = value / 10000;
    return `${Number.isInteger(next) ? next.toFixed(0) : next.toFixed(1)}万`;
  }

  return String(value);
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
  const [remoteFeeds, setRemoteFeeds] = useState<FeedItemData[]>([]);
  const localFeeds = useCommunityFeedStore((state) => state.localFeeds);
  const scrollRef = useRef<ScrollView>(null);
  const topAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const fetchFeeds = () => {
      if (tabIdx === 1) {
        return feedApi.following();
      }
      const tab = tabIdx === 2 ? 'latest' : 'recommend';
      return feedApi.list(tab);
    };
    fetchFeeds()
      .then((res) => { if (alive) setRemoteFeeds(res.data?.records || []); })
      .catch(() => { if (alive) setRemoteFeeds([]); });
    return () => { alive = false; };
  }, [tabIdx, refreshRound]);

  const baseFeeds = useMemo(
    () => [...localFeeds, ...remoteFeeds],
    [localFeeds, remoteFeeds],
  );

  const filteredFeeds = useMemo(() => {
    let feeds = [...baseFeeds];

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      feeds = feeds.filter((feed) =>
        feed.content.toLowerCase().includes(keyword)
        || feed.user.name.toLowerCase().includes(keyword)
        || feed.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    return feeds;
  }, [baseFeeds, searchText]);

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
                    backgroundColor: index === tabIdx ? colors.text : colors.surface,
                    borderColor: index === tabIdx ? colors.text : colors.border,
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
            <MCI name={showSearch ? 'close' : 'magnify'} size={fp(18)} color={colors.textSecondary} />
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
            prefix={<MCI name="magnify" size={fp(16)} color={searchFocused ? COMMUNITY_BLUE : colors.textHint} />}
            autoFocus
            containerStyle={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.border }]}
            style={searchFocused ? { borderColor: COMMUNITY_BLUE, backgroundColor: colors.surface } : undefined}
          />
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COMMUNITY_BLUE} colors={[COMMUNITY_BLUE]} />}
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

      <HoverView onPress={() => navigation.navigate('PublishComposer')} style={[styles.fab, { backgroundColor: COMMUNITY_BLUE }]} hoverScale={1.06} hoverLift={3}>
        <MCI name="plus" size={fp(25)} color="#FFFFFF" />
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
  const currentUser = useAuthStore((state) => state.user);
  const [liked, setLiked] = useState(!!feed.liked);
  const [likeCount, setLikeCount] = useState(feed.likeCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const mediaSwipingRef = useRef(false);
  const gallery = useMemo(() => getFeedMockGallery(feed), [feed]);
  const media = gallery[Math.min(activeMediaIndex, gallery.length - 1)];
  const previewHeight = PREVIEW_WIDTH / gallery[0].aspectRatio;
  const mediaLabel = feed.media.type === 'video' ? 'VIDEO' : feed.media.type === 'gif' ? 'GIF' : 'PHOTO';
  const hasGallery = gallery.length > 1;

  return (
    <PressableScale
      scale={0.99}
      style={{ marginHorizontal: PAD, marginTop: isFirst ? wp(10) : wp(14) }}
      onPress={() => {
        if (mediaSwipingRef.current) {
          mediaSwipingRef.current = false;
          return;
        }

        navigation.navigate('FeedDetail', { feed });
      }}
      dataClass="card"
    >
      <View style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
        <View style={styles.feedHeader}>
          <Pressable style={styles.feedUserRow} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
            <View style={[styles.avatarRing, { borderColor: media.accent }]}>
              <Avatar name={feed.user.name} size={wp(34)} />
            </View>
            <View style={styles.feedUserInfo}>
              <Text style={[styles.feedUserName, { color: colors.text }]}>{feed.user.name}</Text>
              <Text style={[styles.feedUserTitle, { color: colors.textHint }]}>
                {feed.user.title} · {feed.timeAgo}
              </Text>
            </View>
          </Pressable>
          <TouchableOpacity
            activeOpacity={0.78}
            hitSlop={wp(10)}
            style={styles.moreButton}
            onPress={(event) => {
              event.stopPropagation();
              Alert.alert('更多操作', `关于「${feed.user.name}」的这条动态`, [
                {
                  text: '查看作者主页',
                  onPress: () => navigation.navigate('UserProfile', { userName: feed.user.name }),
                },
                {
                  text: '不感兴趣',
                  onPress: () => Alert.alert('已减少推荐', '后续会减少类似动态展示。'),
                },
                {
                  text: '举报内容',
                  style: 'destructive',
                  onPress: () => Alert.alert('举报', '当前演示环境不会提交举报。'),
                },
                { text: '取消', style: 'cancel' },
              ]);
            }}
          >
            <MCI name="dots-horizontal" size={fp(20)} color={colors.textHint} />
          </TouchableOpacity>
        </View>

        <View style={[styles.mediaWrap, { height: previewHeight, backgroundColor: colors.inputBg, borderColor: colors.divider }]}>
          <ScrollView
            horizontal
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onScrollBeginDrag={() => {
              mediaSwipingRef.current = true;
            }}
            onScrollEndDrag={() => {
              setTimeout(() => {
                mediaSwipingRef.current = false;
              }, 160);
            }}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / PREVIEW_WIDTH);
              setActiveMediaIndex(Math.max(0, Math.min(gallery.length - 1, nextIndex)));
              setTimeout(() => {
                mediaSwipingRef.current = false;
              }, 160);
            }}
          >
            {gallery.map((item, index) => (
              <Pressable
                key={`${feed.id}-media-${index}`}
                style={{ width: PREVIEW_WIDTH, height: previewHeight }}
                onPress={(event) => {
                  event.stopPropagation();
                  if (mediaSwipingRef.current) return;
                  setActiveMediaIndex(index);
                  setViewerVisible(true);
                }}
              >
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={{ width: PREVIEW_WIDTH, height: previewHeight }} resizeMode="cover" />
                ) : (
                  <SvgXml xml={item.svg} width={PREVIEW_WIDTH} height={previewHeight} />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.mediaOverlayTop}>
            <View style={[styles.mediaTypeBadge, { backgroundColor: `${media.accent}E6` }]}>
              {feed.media.type === 'video' ? <MCI name="play" size={fp(11)} color="#FFFFFF" /> : null}
              <Text style={styles.mediaTypeText}>{mediaLabel}</Text>
            </View>
            {hasGallery ? (
              <View style={styles.mediaCountBadge}>
                <MCI name="image-multiple-outline" size={fp(12)} color="#FFFFFF" />
                <Text style={styles.mediaCountText}>{activeMediaIndex + 1}/{gallery.length}</Text>
              </View>
            ) : isFresh ? (
              <View style={styles.freshBadge}>
                <Text style={styles.freshBadgeText}>刚刚更新</Text>
              </View>
            ) : null}
          </View>
          {hasGallery ? (
            <View style={styles.mediaDots}>
              {gallery.map((item, index) => (
                <View
                  key={`${feed.id}-dot-${index}`}
                  style={[
                    styles.mediaDot,
                    {
                      width: index === activeMediaIndex ? wp(14) : wp(5),
                      backgroundColor: index === activeMediaIndex ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.socialActionRow}>
          <View style={styles.socialActionLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={likeBusy}
              onPress={async (event) => {
                event.stopPropagation?.();
                if (likeBusy) return;
                if (!currentUser) {
                  Alert.alert('需要登录', '请先登录后再点赞。');
                  return;
                }
                const next = !liked;
                setLiked(next);
                setLikeCount((value) => Math.max(0, value + (next ? 1 : -1)));
                setLikeBusy(true);
                try {
                  if (next) await likeApi.like('feed', feed.id);
                  else await likeApi.unlike('feed', feed.id);
                } catch {
                  setLiked(!next);
                  setLikeCount((value) => Math.max(0, value + (next ? -1 : 1)));
                } finally {
                  setLikeBusy(false);
                }
              }}
              style={styles.iconAction}
            >
              <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(23)} color={liked ? COMMUNITY_ROSE : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.countAction}
              onPress={() => navigation.navigate('FeedDetail', { feed })}
            >
              <MCI name="message-outline" size={fp(23)} color={colors.text} />
              <Text style={[styles.iconCountText, { color: colors.textSecondary }]}>
                {formatCount(feed.commentCount)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.countAction}>
              <MCI name="send-outline" size={fp(22)} color={colors.text} />
              <Text style={[styles.iconCountText, { color: colors.textSecondary }]}>
                {formatCount(feed.shareCount)}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setSaved((value) => !value)} style={styles.iconAction}>
            <MCI name={saved ? 'bookmark' : 'bookmark-outline'} size={fp(23)} color={saved ? COMMUNITY_BLUE : colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.feedBody}>
          <Text style={[styles.likeLine, { color: colors.text }]}>
            {formatCount(likeCount)} 次喜欢
          </Text>
          <Text style={[styles.feedContent, { color: colors.textSecondary }]}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{feed.user.name} </Text>
            {feed.content}
          </Text>
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
        </View>
      </View>

      <FeedMediaViewer
        visible={viewerVisible}
        gallery={gallery}
        initialIndex={activeMediaIndex}
        onClose={() => setViewerVisible(false)}
      />
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: PAD,
    paddingTop: wp(8),
    paddingBottom: wp(8),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  iconButton: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    gap: wp(8),
    paddingRight: wp(6),
  },
  tabPill: {
    minHeight: wp(32),
    paddingHorizontal: wp(15),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillText: {
    fontSize: fp(12),
    fontWeight: '800',
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
    paddingBottom: wp(96) + BOTTOM_SAFE_H,
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
    borderRadius: wp(22),
    overflow: 'hidden',
    ...shadow(3, 8, 0.025, '#0F172A', 1),
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
    paddingTop: wp(12),
    paddingBottom: wp(10),
  },
  feedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feedUserInfo: {
    marginLeft: wp(9),
    flex: 1,
  },
  feedUserName: {
    fontSize: fp(13),
    fontWeight: '900',
  },
  feedUserTitle: {
    marginTop: wp(2),
    fontSize: fp(10),
  },
  avatarRing: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: wp(32),
    height: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedBody: {
    paddingHorizontal: wp(12),
    paddingTop: wp(2),
    paddingBottom: wp(13),
    gap: wp(7),
  },
  likeLine: {
    fontSize: fp(12),
    fontWeight: '900',
  },
  feedContent: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  feedCaption: {
    fontSize: fp(11),
    lineHeight: fp(16),
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(6),
  },
  tagChip: {
    marginRight: 0,
  },
  mediaWrap: {
    overflow: 'hidden',
    borderRadius: 0,
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
  mediaTypeBadge: {
    minHeight: wp(25),
    borderRadius: wp(13),
    paddingHorizontal: wp(9),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  mediaTypeText: {
    color: '#FFFFFF',
    fontSize: fp(9),
    fontWeight: '900',
  },
  mediaCountBadge: {
    minHeight: wp(25),
    borderRadius: wp(13),
    paddingHorizontal: wp(9),
    backgroundColor: 'rgba(15,23,42,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  mediaCountText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '900',
  },
  freshBadge: {
    minHeight: wp(25),
    borderRadius: wp(13),
    paddingHorizontal: wp(9),
    backgroundColor: 'rgba(225,29,72,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freshBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(9),
    fontWeight: '900',
  },
  mediaDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: wp(11),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
  },
  mediaDot: {
    height: wp(5),
    borderRadius: wp(999),
  },
  socialActionRow: {
    minHeight: wp(42),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(9),
    paddingTop: wp(7),
  },
  socialActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  iconAction: {
    width: wp(34),
    height: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countAction: {
    minWidth: wp(42),
    height: wp(30),
    paddingHorizontal: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(4),
  },
  iconCountText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: PAD,
    bottom: wp(106),
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(10, 22, 0.18, COMMUNITY_BLUE, 9),
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
