import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - CARD_GAP) / 2;

const CATEGORIES = [
  { key: '', label: '推荐', icon: '🔥' },
  { key: 'animal', label: '动物', icon: '🐱' },
  { key: 'character', label: '卡通', icon: '🎮' },
  { key: 'flower', label: '花卉', icon: '🌸' },
  { key: 'food', label: '美食', icon: '🍕' },
  { key: 'scenery', label: '风景', icon: '🏔️' },
  { key: 'abstract', label: '抽象', icon: '🎨' },
];

const SORT_OPTIONS = [
  { key: 'latest', label: '最新' },
  { key: 'popular', label: '最热' },
];

const BANNERS = [
  { id: 1, title: '每周精选拼豆图案', subtitle: '编辑推荐', color: '#FF6B6B' },
  { id: 2, title: '春日花卉系列', subtitle: '新品上线', color: '#4ECDC4' },
  { id: 3, title: '像素风角色合集', subtitle: '热门专题', color: '#FFE66D' },
];

export const HomeScreen: React.FC = () => {
  const {
    designs, loading, refreshing, error, hasMore,
    sortBy, category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 首次加载
  useEffect(() => {
    fetchDesigns(true);
  }, []);

  const onRefresh = useCallback(() => {
    fetchDesigns(true);
  }, [fetchDesigns]);

  // 触底加载更多
  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    if (isBottom && hasMore && !loading) {
      fetchDesigns(false);
    }
  }, [hasMore, loading, fetchDesigns]);

  const handleCategoryPress = useCallback((key: string) => {
    setFilter(undefined, key || null);
  }, [setFilter]);

  const handleSortPress = useCallback((key: string) => {
    setFilter(key);
  }, [setFilter]);

  // 搜索防抖
  const handleSearchChange = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      // TODO: 后端实现搜索接口后替换，目前走客户端过滤
      fetchDesigns(true);
    }, 500);
  }, [setSearchKeyword, fetchDesigns]);

  // 搜索过滤（客户端）
  const filteredDesigns = searchKeyword.trim()
    ? designs.filter((d) =>
        d.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()) ||
        d.description?.toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    : designs;

  // 分成两列（简单瀑布流）
  const leftColumn: DesignItem[] = [];
  const rightColumn: DesignItem[] = [];
  filteredDesigns.forEach((item, i) => {
    if (i % 2 === 0) leftColumn.push(item);
    else rightColumn.push(item);
  });

  const showEmpty = !loading && !error && filteredDesigns.length === 0;

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={Colors.gray}
            value={searchKeyword}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Banner */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerWrap}
          contentContainerStyle={styles.bannerContent}
        >
          {BANNERS.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              activeOpacity={0.85}
              style={[styles.bannerCard, { backgroundColor: banner.color }]}
            >
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <View style={styles.bannerDeco}>
                <Text style={styles.bannerDecoText}>🧩</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 分类标签 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => handleCategoryPress(cat.key)}
              style={[
                styles.categoryChip,
                (category || '') === cat.key && styles.categoryChipActive,
              ]}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  (category || '') === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 排序切换 */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => handleSortPress(opt.key)}
              style={styles.sortItem}
            >
              <Text style={[styles.sortText, sortBy === opt.key && styles.sortTextActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.key && <View style={styles.sortIndicator} />}
            </TouchableOpacity>
          ))}
          <View style={styles.sortSpacer} />
          <Text style={styles.resultCount}>
            {filteredDesigns.length > 0 ? `${filteredDesigns.length} 个作品` : ''}
          </Text>
        </View>

        {/* 状态视图 */}
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {showEmpty && <StateView empty emptyText="还没有拼豆作品，快来创作第一个吧" />}

        {/* 瀑布流卡片 */}
        {filteredDesigns.length > 0 && (
          <View style={styles.waterfall}>
            <View style={styles.column}>
              {leftColumn.map((item) => (
                <DesignCard key={item.id} item={item} />
              ))}
            </View>
            <View style={styles.column}>
              {rightColumn.map((item) => (
                <DesignCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {/* 底部加载状态 */}
        {loading && designs.length > 0 && (
          <View style={styles.loadingMore}>
            <StateView loading />
          </View>
        )}
        {!hasMore && designs.length > 0 && (
          <Text style={styles.noMoreText}>— 没有更多了 —</Text>
        )}

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </View>
  );
};

/** 设计卡片 */
const DesignCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  // 根据 id 生成稳定的高度和颜色（真实图片加载前的占位）
  const placeholderHeight = 150 + (item.id * 37) % 100;
  const placeholderColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#DDA0DD', '#87CEEB'];
  const bgColor = placeholderColors[item.id % placeholderColors.length];

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      {item.coverImage ? (
        <View style={[styles.cardImage, { height: placeholderHeight }]}>
          {/* Image 组件在有真实 coverImage 时使用 */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
          <Text style={styles.cardEmoji}>🧩</Text>
        </View>
      ) : (
        <View style={[styles.cardImage, { height: placeholderHeight, backgroundColor: bgColor }]}>
          <Text style={styles.cardEmoji}>🧩</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.cardFooter}>
          <Text style={styles.cardAuthor}>{item.authorName || `用户${item.userId}`}</Text>
          <View style={styles.likeWrap}>
            <Text style={styles.likeIcon}>♥</Text>
            <Text style={styles.likeCount}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grayBg,
  },
  // 搜索
  searchBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayBg,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.black,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.gray,
    padding: Spacing.xs,
  },
  // Banner
  bannerWrap: { marginTop: Spacing.sm },
  bannerContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bannerCard: {
    width: SCREEN_WIDTH - Spacing.md * 2,
    height: 140,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginBottom: Spacing.xs },
  bannerTitle: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '700' },
  bannerDeco: { position: 'absolute', right: 20, bottom: 10, opacity: 0.3 },
  bannerDecoText: { fontSize: 64 },
  // 分类
  categoryList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryIcon: { fontSize: 14, marginRight: 4 },
  categoryLabel: { fontSize: FontSize.md, color: Colors.dark },
  categoryLabelActive: { color: Colors.white, fontWeight: '600' },
  // 排序
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sortItem: { alignItems: 'center', marginRight: Spacing.lg },
  sortText: { fontSize: FontSize.md, color: Colors.gray },
  sortTextActive: { color: Colors.primary, fontWeight: '600' },
  sortIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  sortSpacer: { flex: 1 },
  resultCount: { fontSize: FontSize.xs, color: Colors.grayLight },
  // 瀑布流
  waterfall: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: CARD_GAP },
  column: { flex: 1, gap: CARD_GAP },
  // 卡片
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, overflow: 'hidden' },
  cardImage: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 40, opacity: 0.4 },
  cardInfo: { padding: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.black, marginBottom: 2 },
  cardDesc: { fontSize: FontSize.xs, color: Colors.gray, marginBottom: Spacing.xs, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAuthor: { fontSize: FontSize.xs, color: Colors.gray },
  likeWrap: { flexDirection: 'row', alignItems: 'center' },
  likeIcon: { color: Colors.primary, fontSize: 12, marginRight: 2 },
  likeCount: { fontSize: FontSize.xs, color: Colors.gray },
  // 底部
  loadingMore: { paddingVertical: Spacing.md },
  noMoreText: { textAlign: 'center', color: Colors.grayLight, fontSize: FontSize.sm, paddingVertical: Spacing.lg },
});
