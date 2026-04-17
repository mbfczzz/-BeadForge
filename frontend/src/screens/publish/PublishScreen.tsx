import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TextInput, RefreshControl, Animated, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar as HeroAvatar, Button, Card, Chip } from 'heroui-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { HoverView, ALL_PATTERNS, PressableScale } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import type { RootStackParamList, FeedItemData } from '../../navigation/types';
import {
  ALL_FEEDS,
  COMMUNITY_TABS,
  FOLLOWING_NAMES,
  HOT_TOPICS,
} from '../../mock/app';
import { getFeedMockPhoto } from '../../utils/feedMedia';

const PAD = wp(15);
const PREVIEW_WIDTH = screenW - PAD * 2 - wp(12);
const TAG_COLORS = ['accent', 'default', 'success', 'warning'] as const;

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function getAvatarFallback(name: string) {
  const plain = name.trim().replace(/\s+/g, '');
  return plain.slice(0, Math.min(2, plain.length)) || 'BF';
}

function rotateFeeds(feeds: FeedItemData[], step: number) {
  if (feeds.length <= 1) {
    return feeds;
  }

  const offset = step % feeds.length;
  if (offset === 0) {
    return feeds;
  }

  return [...feeds.slice(offset), ...feeds.slice(0, offset)];
}

export const PublishScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tabIdx, setTabIdx] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
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
      feeds = feeds.filter((feed) => FOLLOWING_NAMES.has(feed.user.name));
    } else if (tabIdx === 2) {
      feeds.sort((a, b) => b.id - a.id);
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      feeds = feeds.filter((feed) =>
        feed.content.toLowerCase().includes(keyword) ||
        feed.user.name.toLowerCase().includes(keyword) ||
        feed.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    return feeds;
  }, [baseFeeds, searchText, tabIdx]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshRound((value) => value + 1);
      setRefreshing(false);
    }, 700);
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldShow = e.nativeEvent.contentOffset.y > 320;
    setShowTop(shouldShow);
    Animated.timing(topAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [topAnim]);

  const onTagPress = useCallback((tag: string) => {
    setShowSearch(true);
    setSearchText(tag);
  }, []);

  const handlePublish = useCallback(() => {
    Alert.alert('发布动态', '当前演示环境只展示 mock 数据，发布能力暂不接入。');
  }, []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.header, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={$.tabRow}>
          {COMMUNITY_TABS.map((tab, index) => {
            const active = index === tabIdx;
            return (
              <HoverView key={tab} onPress={() => setTabIdx(index)} style={$.tab} hoverScale={1.04} hoverLift={0}>
                <Text style={[$.tabText, { color: active ? colors.text : colors.textHint }, active && $.tabTextActive]}>{tab}</Text>
                {active && <View style={[$.tabIndicator, { backgroundColor: colors.accent }]} />}
              </HoverView>
            );
          })}
        </View>
        <HoverView
          onPress={() => {
            setShowSearch((value) => !value);
            if (showSearch) setSearchText('');
          }}
          style={[$.iconBtn, { backgroundColor: showSearch ? colors.accentLight : colors.inputBg }]}
          hoverScale={1.08}
          hoverLift={0}
        >
          <MCI name={showSearch ? 'close' : 'magnify'} size={fp(18)} color={showSearch ? colors.accent : colors.textHint} />
        </HoverView>
      </View>

      {showSearch && (
        <View style={[$.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[$.searchInputWrap, { backgroundColor: colors.inputBg, borderColor: searchText ? `${colors.accent}40` : 'transparent' }]}>
            <MCI name="magnify" size={fp(16)} color={colors.textHint} />
            <TextInput
              style={[$.searchInput, { color: colors.text }]}
              placeholder="搜索动态、作者或标签..."
              placeholderTextColor={colors.textHint}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <HoverView onPress={() => setSearchText('')} hoverScale={1.08} hoverLift={0}>
                <MCI name="close-circle" size={fp(16)} color={colors.textHint} />
              </HoverView>
            )}
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(84) + BOTTOM_SAFE_H }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        onScroll={onScroll}
        scrollEventThrottle={64}
      >
        {!showSearch && tabIdx === 0 && (
          <View style={[$.topicsSection, { backgroundColor: colors.surface }]}>
            <View style={$.topicsHeader}>
              <View style={[$.topicsIconCircle, { backgroundColor: '#FFF0E6' }]}>
                <MCI name="fire" size={fp(14)} color="#FF6B35" />
              </View>
              <Text style={[$.topicsTitle, { color: colors.text }]}>热门话题</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={$.topicsPills}>
              {HOT_TOPICS.map((topic) => (
                <HoverView
                  key={topic.tag}
                  onPress={() => onTagPress(topic.tag)}
                  style={[$.topicPill, { backgroundColor: colors.accentLight, borderColor: `${colors.accent}20` }]}
                  hoverScale={1.04}
                  hoverLift={0}
                >
                  <Text style={[$.topicTag, { color: colors.accent }]}>#{topic.tag}</Text>
                  <Text style={[$.topicCount, { color: `${colors.accent}AA` }]}>{topic.count}</Text>
                </HoverView>
              ))}
            </ScrollView>
          </View>
        )}

        {refreshRound > 0 && filteredFeeds.length > 0 && (
          <View style={$.refreshNotice}>
            <Chip variant="soft" color="accent" animation="disable-all">
              <Chip.Label>{`已为你刷新 ${Math.min(filteredFeeds.length, 3)} 条新分享`}</Chip.Label>
            </Chip>
          </View>
        )}

        {filteredFeeds.length === 0 ? (
          <View style={$.emptyState}>
            <View style={[$.emptyIcon, { backgroundColor: colors.inputBg }]}>
              <MCI name={searchText ? 'text-search' : tabIdx === 1 ? 'account-group-outline' : 'tray-alert'} size={fp(30)} color={colors.textHint} />
            </View>
            <Text style={[$.emptyTitle, { color: colors.text }]}>
              {searchText ? '没有找到相关动态' : tabIdx === 1 ? '还没有关注的作者' : '暂无动态'}
            </Text>
            <Text style={[$.emptyHint, { color: colors.textHint }]}>
              {searchText ? '换个关键词试试' : tabIdx === 1 ? '先从推荐流里挑几个感兴趣的作者' : '下拉刷新后再看看'}
            </Text>
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

      <HoverView onPress={handlePublish} style={[$.fab, { backgroundColor: colors.accent }]} hoverScale={1.08} hoverLift={3}>
        <MCI name="pencil-plus-outline" size={fp(22)} color="#fff" />
      </HoverView>

      {showTop && (
        <Animated.View
          style={[$.topFab, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: topAnim,
            transform: [{ translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}
        >
          <HoverView onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} hoverScale={1.08} hoverLift={0} style={$.topFabInner}>
            <MCI name="arrow-up" size={fp(18)} color={colors.textHint} />
          </HoverView>
        </Animated.View>
      )}
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
  const pattern = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const media = useMemo(() => getFeedMockPhoto(feed), [feed]);
  const previewHeight = PREVIEW_WIDTH / media.aspectRatio;

  return (
    <PressableScale
      scale={0.985}
      style={{ marginHorizontal: PAD, marginTop: isFirst ? wp(12) : wp(10) }}
      onPress={() => navigation.navigate('FeedDetail', { feed })}
      dataClass="card"
    >
      <Card variant="secondary" style={[$.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Card.Header style={$.feedHeader}>
          <Pressable style={$.feedUserRow} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
            <HeroAvatar alt={feed.user.name} size="md" variant="soft" color="accent" animation="disable-all">
              <HeroAvatar.Fallback>{getAvatarFallback(feed.user.name)}</HeroAvatar.Fallback>
            </HeroAvatar>
            <View style={$.feedUserInfo}>
              <Text style={[$.feedUserName, { color: colors.text }]}>{feed.user.name}</Text>
              <Text style={[$.feedUserTitle, { color: colors.textHint }]}>{feed.user.title} · {feed.timeAgo}</Text>
            </View>
          </Pressable>

          <Button
            size="sm"
            variant="ghost"
            feedbackVariant="scale"
            onPress={() => Alert.alert('提示', '当前演示环境不记录关注状态。')}
            style={$.followBtn}
          >
            <Button.Label>关注</Button.Label>
          </Button>
        </Card.Header>

        <Card.Body style={$.feedBody}>
          <Text style={[$.feedContent, { color: colors.textSecondary }]}>{feed.content}</Text>

          <View style={$.tagWrap}>
            {feed.tags.map((tag, index) => (
              <Chip
                key={`${feed.id}-${tag}`}
                size="sm"
                variant="soft"
                color={TAG_COLORS[index % TAG_COLORS.length]}
                onPress={() => onTagPress(tag)}
                animation="disable-all"
                style={$.tagChip}
              >
                <Chip.Label>{`#${tag}`}</Chip.Label>
              </Chip>
            ))}
          </View>

          <View style={[$.mediaWrap, { height: previewHeight, borderColor: `${media.accent}20` }]}>
            <SvgXml xml={media.xml} width={PREVIEW_WIDTH} height={previewHeight} />

            <View style={$.mediaTopBar}>
              {isFresh ? (
                <Chip size="sm" variant="secondary" color="accent" animation="disable-all">
                  <Chip.Label>刚刚更新</Chip.Label>
                </Chip>
              ) : (
                <View />
              )}
              <Chip size="sm" variant="secondary" color="default" animation="disable-all">
                <Chip.Label>{feed.tags[0] ? `#${feed.tags[0]}` : '分享'}</Chip.Label>
              </Chip>
            </View>

            <View style={$.mediaBottomBar}>
              <View style={$.mediaMetaBlock}>
                <Text style={$.mediaMetaTitle}>{feed.user.name}</Text>
                <Text style={$.mediaMetaHint}>{`${feed.user.title} · ${feed.timeAgo}`}</Text>
              </View>
              <View style={$.mediaMetaStat}>
                <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(16)} color="#FFFFFF" />
                <Text style={$.mediaMetaStatText}>{formatCount(feed.likeCount + (liked ? 1 : 0))}</Text>
              </View>
            </View>
          </View>
        </Card.Body>

        <Card.Footer style={$.feedFooter}>
          <View style={$.actionRow}>
            <HoverView onPress={() => setLiked((value) => !value)} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
              <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(18)} color={liked ? '#EF4444' : colors.textHint} />
              <Text style={[$.actionText, { color: liked ? '#EF4444' : colors.textHint }]}>{formatCount(feed.likeCount + (liked ? 1 : 0))}</Text>
            </HoverView>
            <HoverView onPress={() => navigation.navigate('FeedDetail', { feed })} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
              <MCI name="comment-outline" size={fp(18)} color={colors.textHint} />
              <Text style={[$.actionText, { color: colors.textHint }]}>{formatCount(feed.commentCount)}</Text>
            </HoverView>
            <HoverView onPress={() => Alert.alert('分享', '当前演示环境不接入系统分享。')} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
              <MCI name="share-outline" size={fp(18)} color={colors.textHint} />
              <Text style={[$.actionText, { color: colors.textHint }]}>{formatCount(feed.shareCount)}</Text>
            </HoverView>
          </View>

          <View style={$.actionRowRight}>
            <HoverView onPress={() => setSaved((value) => !value)} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
              <MCI name={saved ? 'bookmark' : 'bookmark-outline'} size={fp(18)} color={saved ? colors.accent : colors.textHint} />
            </HoverView>
            <Button
              size="sm"
              variant="primary"
              feedbackVariant="scale"
              onPress={() => navigation.navigate('Editor', { mode: 'manual', cols: pattern[0]?.length || 9, rows: pattern.length })}
              style={$.makeBtn}
            >
              <Button.Label>制作同款</Button.Label>
            </Button>
          </View>
        </Card.Footer>
      </Card>
    </PressableScale>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: wp(52),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: { fontSize: fp(18), fontWeight: '800' },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: wp(14), justifyContent: 'center' },
  tab: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: fp(13), paddingVertical: wp(2) },
  tabTextActive: { fontWeight: '700' },
  tabIndicator: { width: wp(18), height: wp(3), borderRadius: wp(2), marginTop: wp(4) },
  iconBtn: {
    position: 'absolute',
    right: PAD,
    top: wp(9),
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    paddingHorizontal: PAD,
    paddingVertical: wp(10),
    borderBottomWidth: 1,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(12),
    paddingHorizontal: wp(12),
    minHeight: wp(42),
  },
  searchInput: { flex: 1, fontSize: fp(13), marginLeft: wp(8), paddingVertical: wp(8) },
  topicsSection: { marginTop: wp(10), paddingVertical: wp(14) },
  topicsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD },
  topicsIconCircle: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(8),
  },
  topicsTitle: { fontSize: fp(14), fontWeight: '700' },
  topicsPills: { paddingHorizontal: PAD, paddingTop: wp(12), gap: wp(8) },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(14),
    paddingHorizontal: wp(12),
    paddingVertical: wp(8),
    gap: wp(8),
  },
  topicTag: { fontSize: fp(12), fontWeight: '700' },
  topicCount: { fontSize: fp(11) },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: PAD, paddingVertical: wp(60) },
  emptyIcon: {
    width: wp(54),
    height: wp(54),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(14),
  },
  emptyTitle: { fontSize: fp(15), fontWeight: '700' },
  emptyHint: { fontSize: fp(12), marginTop: wp(6), textAlign: 'center' },
  refreshNotice: { marginTop: wp(10), marginHorizontal: PAD, alignItems: 'center' },
  feedCard: {
    borderRadius: wp(24),
    borderWidth: 1,
    overflow: 'hidden',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(14),
    paddingTop: wp(14),
    paddingBottom: wp(6),
  },
  feedBody: {
    paddingHorizontal: wp(14),
    paddingTop: 0,
    paddingBottom: 0,
  },
  feedUserRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  feedUserInfo: { marginLeft: wp(10), flex: 1 },
  feedUserName: { fontSize: fp(14), fontWeight: '700' },
  feedUserTitle: { fontSize: fp(11), marginTop: wp(2) },
  followBtn: { minWidth: wp(70) },
  feedContent: { marginTop: wp(12), fontSize: fp(13), lineHeight: fp(19) },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginTop: wp(12) },
  tagChip: { alignSelf: 'flex-start' },
  mediaWrap: {
    marginTop: wp(14),
    borderRadius: wp(22),
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    backgroundColor: '#F7FAFF',
  },
  mediaTopBar: {
    position: 'absolute',
    top: wp(12),
    left: wp(12),
    right: wp(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaBottomBar: {
    position: 'absolute',
    left: wp(14),
    right: wp(14),
    bottom: wp(14),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  mediaMetaBlock: { flex: 1, paddingRight: wp(10) },
  mediaMetaTitle: { color: '#FFFFFF', fontSize: fp(14), fontWeight: '700' },
  mediaMetaHint: { color: 'rgba(255,255,255,0.82)', fontSize: fp(11), marginTop: wp(4) },
  mediaMetaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: wp(8),
    borderRadius: wp(999),
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  mediaMetaStatText: { color: '#FFFFFF', fontSize: fp(11), fontWeight: '700' },
  feedFooter: {
    marginTop: wp(2),
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: wp(14) },
  actionRowRight: { flexDirection: 'row', alignItems: 'center', gap: wp(12) },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: wp(5) },
  actionText: { fontSize: fp(11), fontWeight: '600' },
  makeBtn: { minWidth: wp(90) },
  fab: {
    position: 'absolute',
    right: PAD,
    bottom: wp(22) + BOTTOM_SAFE_H,
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topFab: {
    position: 'absolute',
    right: PAD,
    bottom: wp(84) + BOTTOM_SAFE_H,
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    borderWidth: 1,
  },
  topFabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
