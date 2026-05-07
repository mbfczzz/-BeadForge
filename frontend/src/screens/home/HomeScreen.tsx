import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ALL_PATTERNS,
  BeadGrid,
  HomeBannerCarousel,
  Input,
  StateView,
} from '../../components/common';
import {
  discoveryApi,
  type DiscoverFilterTabDef,
  type DiscoverHomeConfig,
  type HomeBannerItem,
} from '../../api/discovery';
import type { RootStackParamList } from '../../navigation/types';
import { usePatternStore, type MarketPattern } from '../../store/usePatternStore';
import { useTheme } from '../../theme';
import { BOTTOM_SAFE_H, fp, getCardWidth, wp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(18);
const CARD_GAP = wp(12);
const CARD_W = getCardWidth(PAD, CARD_GAP, 2);
const DEFAULT_DISCOVER_CONFIG: DiscoverHomeConfig = {
  defaultTabKey: 'all',
  searchPlaceholder: '搜索图纸、作者或分类',
  resultTitle: '为你推荐',
  emptyText: '暂无匹配的图纸资源',
  tabs: [],
};

function matchesTab(item: MarketPattern, tab?: DiscoverFilterTabDef) {
  if (!tab) return true;
  if (tab.categories?.length && !tab.categories.includes(item.cat)) return false;
  if (tab.accessModes?.length && !tab.accessModes.includes(item.accessMode)) return false;
  return true;
}

function sortDiscoveryItems(items: MarketPattern[], sort: 'latest' | 'hot' = 'hot') {
  const sorted = [...items];
  if (sort === 'latest') {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }
  sorted.sort((a, b) => b.downloads - a.downloads);
  return sorted;
}

function splitIntoMasonryColumns(items: MarketPattern[]) {
  return items.reduce<{ left: MarketPattern[]; right: MarketPattern[] }>((acc, item, index) => {
    if (index % 2 === 0) acc.left.push(item);
    else acc.right.push(item);
    return acc;
  }, { left: [], right: [] });
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const listings = usePatternStore((state) => state.listings);
  const refreshing = usePatternStore((state) => state.refreshing);
  const refreshListings = usePatternStore((state) => state.refreshListings);
  const myListings = usePatternStore((state) => state.myListings);
  const homeBanners = usePatternStore((state) => state.homeBanners);
  const setHomeBanners = usePatternStore((state) => state.setHomeBanners);

  const [discoverConfig, setDiscoverConfig] = useState<DiscoverHomeConfig>(DEFAULT_DISCOVER_CONFIG);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [configRefreshing, setConfigRefreshing] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(DEFAULT_DISCOVER_CONFIG.defaultTabKey);

  useEffect(() => {
    let active = true;

    void discoveryApi.getHomePayload().then((payload) => {
      if (!active) {
        return;
      }

      setDiscoverConfig(payload.config);
      setHomeBanners(payload.banners);
      setActiveTabKey((current) => {
        const exists = payload.config.tabs.some((item) => item.key === current);
        return exists ? current : payload.config.defaultTabKey;
      });
    });

    // 首次进入拉一次图纸列表（store 不再用 mock 自动填充）
    void refreshListings();

    return () => {
      active = false;
    };
  }, [refreshListings, setHomeBanners]);

  const tabs = discoverConfig.tabs;
  const activeTab = useMemo(
    () => tabs.find((item) => item.key === activeTabKey) ?? tabs[0],
    [activeTabKey, tabs],
  );

  const scopedListings = useMemo(
    () => listings.filter((item) => matchesTab(item, activeTab)),
    [activeTab, listings],
  );

  const scopedBanners = useMemo(
    () => homeBanners.filter((item) => item.enabled !== false),
    [homeBanners],
  );

  const filteredFiles = useMemo(() => {
    let list = [...scopedListings];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((item) =>
        item.title.toLowerCase().includes(keyword)
        || item.author.toLowerCase().includes(keyword)
        || item.desc.toLowerCase().includes(keyword)
        || item.cat.toLowerCase().includes(keyword),
      );
    }

    return sortDiscoveryItems(list, activeTab?.sort ?? 'hot');
  }, [activeTab?.sort, scopedListings, search]);

  const masonryColumns = useMemo(() => splitIntoMasonryColumns(filteredFiles), [filteredFiles]);

  const handleRefresh = async () => {
    setConfigRefreshing(true);
    try {
      const [payload] = await Promise.all([
        discoveryApi.getHomePayload(),
        refreshListings(),
      ]);
      setDiscoverConfig(payload.config);
      setHomeBanners(payload.banners);
      setActiveTabKey((current) => {
        const exists = payload.config.tabs.some((item) => item.key === current);
        return exists ? current : payload.config.defaultTabKey;
      });
    } finally {
      setConfigRefreshing(false);
    }
  };

  const openDetail = (resourceId: number) => {
    navigation.navigate('ResourceDetail', { resourceId });
  };

  const handleBannerPress = (banner: HomeBannerItem) => {
    navigation.navigate('BannerDetail', { banner });
  };

  const renderStatusText = (file: MarketPattern) => {
    if (myListings.has(file.id)) return '已购';
    if (file.accessMode === 'free') return '免费';
    if (file.accessMode === 'points') return `${file.pointsCost} 积分`;
    return '会员';
  };

  const renderStatusColor = (file: MarketPattern) => {
    if (myListings.has(file.id)) return colors.success;
    if (file.accessMode === 'free') return colors.success;
    if (file.accessMode === 'points') return colors.gold;
    return colors.accent;
  };

  const renderCoverHeight = (item: MarketPattern) => wp(152) + (item.id % 3) * wp(18);

  const renderCard = (item: MarketPattern) => {
    const pixels = item.gridData || ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length];
    const previewHeight = renderCoverHeight(item);

    return (
      <View key={item.id} style={styles.cardWrap}>
        <TouchableOpacity activeOpacity={0.86} onPress={() => openDetail(item.id)}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.inputBg, colors.surface] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.preview, { height: previewHeight, borderColor: colors.divider }]}
            >
              <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{item.cat}</Text>
              </View>
              <BeadGrid pixels={pixels} beadSize={wp(5.6)} gap={0.8} round glossy={false} />
            </LinearGradient>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.likeRow}>
                  <Feather name="heart" size={fp(12)} color={colors.textHint} />
                  <Text style={[styles.metaText, { color: colors.textHint }]}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{item.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.metaText, { color: colors.textHint }]}>{item.cols}x{item.rows}</Text>
                <Text style={[styles.statusText, { color: renderStatusColor(item) }]}>{renderStatusText(item)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.searchWrap}>
        <Input
          placeholder={activeTab?.searchPlaceholder || discoverConfig.searchPlaceholder || '搜索图纸、作者或分类'}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          prefix={<Feather name="search" size={fp(14)} color={searchFocused ? colors.accent : colors.textHint} />}
          suffix={search ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearch('')}>
              <Feather name="x" size={fp(13)} color={colors.textHint} />
            </TouchableOpacity>
          ) : undefined}
          containerStyle={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.border }]}
          style={searchFocused ? { backgroundColor: colors.surface, borderColor: colors.accent } : undefined}
        />
      </View>

      {scopedBanners.length > 0 ? (
        <HomeBannerCarousel banners={scopedBanners} onPressBanner={handleBannerPress} />
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {tabs.map((item) => {
          const active = activeTab?.key === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.82}
              onPress={() => setActiveTabKey(item.key)}
              style={[
                styles.topicPill,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.topicPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {activeTab?.resultTitle || discoverConfig.resultTitle || '为你推荐'}
        </Text>
        <Text style={[styles.resultsHint, { color: colors.textHint }]}>{filteredFiles.length} 个图纸</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <FlatList
        data={[0]}
        keyExtractor={() => 'discover'}
        renderItem={() => (
          <View style={styles.masonryRow}>
            <View style={styles.masonryColumn}>{masonryColumns.left.map(renderCard)}</View>
            <View style={styles.masonryColumn}>{masonryColumns.right.map(renderCard)}</View>
          </View>
        )}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing || configRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={<StateView empty emptyText={activeTab?.emptyText || discoverConfig.emptyText || '暂无匹配的图纸资源'} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: PAD,
    paddingTop: wp(6),
    paddingBottom: wp(36) + BOTTOM_SAFE_H,
  },
  header: {
    paddingBottom: wp(16),
  },
  searchWrap: {
    marginBottom: wp(16),
  },
  searchField: {
    borderWidth: 1,
    borderRadius: wp(999),
  },
  filterRow: {
    gap: wp(10),
    paddingTop: wp(14),
    paddingBottom: wp(14),
  },
  topicPill: {
    minHeight: wp(34),
    paddingHorizontal: wp(16),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicPillText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: wp(2),
  },
  resultsText: {
    fontSize: fp(16),
    fontWeight: '800',
  },
  resultsHint: {
    fontSize: fp(12),
  },
  masonryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  masonryColumn: {
    width: CARD_W,
    gap: CARD_GAP,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    borderRadius: wp(24),
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow(8, 24, 0.06, '#1D3D6B', 6),
  },
  preview: {
    borderBottomWidth: 1,
    paddingHorizontal: wp(12),
    paddingTop: wp(12),
    paddingBottom: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: wp(12),
    left: wp(12),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  categoryBadgeText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: wp(12),
    paddingVertical: wp(12),
    gap: wp(6),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(8),
  },
  cardTitle: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '800',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  cardDesc: {
    fontSize: fp(11),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: fp(10),
    fontWeight: '600',
  },
  statusText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
});
