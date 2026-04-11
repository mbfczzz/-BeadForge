import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - CARD_GAP) / 2;

const CATEGORIES = [
  { key: '', label: '全部', icon: '🔥' },
  { key: 'animal', label: '动物', icon: '🐱' },
  { key: 'character', label: '卡通', icon: '🎮' },
  { key: 'flower', label: '花卉', icon: '🌸' },
  { key: 'food', label: '美食', icon: '🍕' },
  { key: 'scenery', label: '风景', icon: '🏔️' },
  { key: 'abstract', label: '抽象', icon: '🎨' },
];

const BANNERS = [
  { id: 1, title: '每周精选', subtitle: '编辑推荐的拼豆图案', emoji: '🏆', bg: Colors.primary, shadowBg: Colors.primaryDark },
  { id: 2, title: '春日系列', subtitle: '花卉主题新品上线', emoji: '🌷', bg: Colors.blue, shadowBg: Colors.blueDark },
  { id: 3, title: '像素合集', subtitle: '经典角色全收录', emoji: '👾', bg: Colors.orange, shadowBg: Colors.orangeDark },
];

const CARD_COLORS = [
  { bg: '#E8F5E9', accent: Colors.primary },
  { bg: '#E3F2FD', accent: Colors.blue },
  { bg: '#FFF8E1', accent: Colors.orange },
  { bg: '#F3E5F5', accent: Colors.purple },
  { bg: '#FCE4EC', accent: Colors.pink },
  { bg: '#E0F7FA', accent: '#00BCD4' },
];

export const HomeScreen: React.FC = () => {
  const {
    designs, loading, refreshing, error, hasMore,
    sortBy, category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchDesigns(true); }, []);

  const onRefresh = useCallback(() => { fetchDesigns(true); }, [fetchDesigns]);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 100 && hasMore && !loading) {
      fetchDesigns(false);
    }
  }, [hasMore, loading, fetchDesigns]);

  const handleCategoryPress = useCallback((key: string) => {
    setFilter(undefined, key || null);
  }, [setFilter]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, [setSearchKeyword, fetchDesigns]);

  const filteredDesigns = searchKeyword.trim()
    ? designs.filter((d) =>
        d.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()) ||
        d.description?.toLowerCase().includes(searchKeyword.trim().toLowerCase()))
    : designs;

  const leftCol: DesignItem[] = [];
  const rightCol: DesignItem[] = [];
  filteredDesigns.forEach((item, i) => (i % 2 === 0 ? leftCol : rightCol).push(item));

  return (
    <View style={styles.container}>
      {/* 顶部 */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>🧩</Text>
        <Text style={styles.logoText}>BeadForge</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 7</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={Colors.grayLight}
            value={searchKeyword}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Banner */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerList}>
          {BANNERS.map((b) => (
            <TouchableOpacity key={b.id} activeOpacity={0.85} style={styles.bannerOuter}>
              <View style={[styles.bannerShadow, { backgroundColor: b.shadowBg }]} />
              <View style={[styles.bannerCard, { backgroundColor: b.bg }]}>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                </View>
                <Text style={styles.bannerEmoji}>{b.emoji}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 分类 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {CATEGORIES.map((cat) => {
            const active = (category || '') === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => handleCategoryPress(cat.key)}
                style={[styles.catChip, active && styles.catChipActive]}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 排序 */}
        <View style={styles.sortRow}>
          {['latest', 'popular'].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.sortChip, sortBy === key && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, sortBy === key && styles.sortTextActive]}>
                {key === 'latest' ? '🕐 最新' : '❤️ 最热'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 状态 */}
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filteredDesigns.length === 0 && (
          <StateView empty emptyText="还没有作品，快来创作吧" emptyIcon="🎨" />
        )}

        {/* 瀑布流 */}
        {filteredDesigns.length > 0 && (
          <View style={styles.waterfall}>
            <View style={styles.column}>
              {leftCol.map((item) => <DesignCard key={item.id} item={item} />)}
            </View>
            <View style={styles.column}>
              {rightCol.map((item) => <DesignCard key={item.id} item={item} />)}
            </View>
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={styles.endText}>🎉 全部加载完毕</Text>
        )}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
};

/** 多邻国风卡片 - 3D 圆角 + 粗边框 */
const DesignCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const h = 140 + (item.id * 37) % 80;
  const palette = CARD_COLORS[item.id % CARD_COLORS.length];

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.cardOuter}>
      <View style={[styles.cardShadow, { height: h + 52 }]} />
      <View style={styles.cardInner}>
        <View style={[styles.cardImage, { height: h, backgroundColor: palette.bg }]}>
          <Text style={styles.cardEmoji}>🧩</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardAuthor}>{item.authorName || `创作者`}</Text>
            <View style={styles.likeWrap}>
              <Text style={styles.likeHeart}>❤️</Text>
              <Text style={styles.likeNum}>{item.likeCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.snow },

  // TopBar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayBg,
  },
  logo: { fontSize: 28 },
  logoText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, marginLeft: Spacing.sm },
  topBarRight: { marginLeft: 'auto' },
  streakBadge: {
    backgroundColor: Colors.yellow + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.yellow,
  },
  streakText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.orangeDark },

  // Search
  searchWrap: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.white },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.snow,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.grayBg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.black, fontWeight: '600', padding: 0 },
  clearBtn: { padding: Spacing.xs },
  clearText: { fontSize: 16, color: Colors.grayLight, fontWeight: '700' },

  // Banner
  bannerList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 12 },
  bannerOuter: { width: SCREEN_WIDTH * 0.75, position: 'relative', marginRight: 12 },
  bannerShadow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: 110, borderRadius: BorderRadius.xl,
  },
  bannerCard: {
    height: 110, borderRadius: BorderRadius.xl, marginBottom: 5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  bannerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  bannerEmoji: { fontSize: 48 },

  // Categories
  catList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 2, borderColor: Colors.grayBg,
    marginRight: Spacing.sm,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  catIcon: { fontSize: 16, marginRight: 4 },
  catLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.grayDark },
  catLabelActive: { color: Colors.white },

  // Sort
  sortRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 2, borderColor: Colors.grayBg,
  },
  sortChipActive: { borderColor: Colors.blue, backgroundColor: Colors.blue + '15' },
  sortText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray },
  sortTextActive: { color: Colors.blue },

  // Waterfall
  waterfall: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: CARD_GAP },
  column: { flex: 1, gap: CARD_GAP },

  // Card
  cardOuter: { position: 'relative' },
  cardShadow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.shadowGray, borderRadius: BorderRadius.lg,
  },
  cardInner: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    overflow: 'hidden', marginBottom: 4,
    borderWidth: 2, borderColor: Colors.grayBg,
  },
  cardImage: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 36, opacity: 0.5 },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardAuthor: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray },
  likeWrap: { flexDirection: 'row', alignItems: 'center' },
  likeHeart: { fontSize: 12, marginRight: 2 },
  likeNum: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray },

  endText: { textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.grayLight, paddingVertical: Spacing.lg },
});
