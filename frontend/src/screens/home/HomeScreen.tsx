import React, { useEffect, useCallback, useRef, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, RefreshControl, TextInput,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

const { width: SCREEN_W } = Dimensions.get('window');
const COL_COUNT = SCREEN_W > 600 ? 4 : SCREEN_W > 400 ? 3 : 2;
const GAP = 8;
const PADDING = 12;
const CARD_W = (SCREEN_W - PADDING * 2 - GAP * (COL_COUNT - 1)) / COL_COUNT;

const CARD_BGS_LIGHT = ['#FFF0F2', '#FFF8ED', '#EDFAFF', '#F0FFF4', '#FFF0FA', '#FFFDE7', '#F0F0FF', '#FFF5EE'];
const CARD_BGS_DARK = ['#2A1520', '#2A2518', '#152028', '#182A1C', '#2A1528', '#2A2A15', '#1A1A30', '#2A2018'];

const NAV_ITEMS = ['全部', '动物', '卡通', '花卉', '美食', '风景', '抽象', '像素'];
const NAV_KEYS = ['', 'animal', 'character', 'flower', 'food', 'scenery', 'abstract', 'pixel'];

/** Banner 轮播数据 */
const BANNERS = [
  { id: 1, title: '热门精选', desc: '本周最受欢迎的拼豆图案', patIdx: 0, gradStart: '#FF6B6B', gradEnd: '#FF8E8E' },
  { id: 2, title: '可爱萌宠', desc: '人气动物系列合集', patIdx: 1, gradStart: '#FFA726', gradEnd: '#FFCC80' },
  { id: 3, title: '像素经典', desc: '游戏角色完美还原', patIdx: 2, gradStart: '#42A5F5', gradEnd: '#90CAF9' },
  { id: 4, title: '花之物语', desc: '春日限定花卉图案', patIdx: 3, gradStart: '#EC407A', gradEnd: '#F48FB1' },
];

export const HomeScreen: React.FC = () => {
  const { colors, dark, toggle } = useTheme();
  const {
    designs, loading, refreshing, error, hasMore,
    category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const bannerRef = useRef<ScrollView>(null);
  const activeNav = NAV_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);

  // Banner 自动轮播
  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (SCREEN_W - PADDING * 2 + GAP), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = useCallback(() => fetchDesigns(true), [fetchDesigns]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowTop(y > 300);
    const { layoutMeasurement, contentSize } = e.nativeEvent;
    if (y + layoutMeasurement.height >= contentSize.height - 200 && hasMore && !loading) {
      fetchDesigns(false);
    }
  }, [hasMore, loading, fetchDesigns]);

  const handleSearch = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, [setSearchKeyword, fetchDesigns]);

  const filtered = searchKeyword.trim()
    ? designs.filter((d) => d.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()))
    : designs;

  const columns: DesignItem[][] = Array.from({ length: COL_COUNT }, () => []);
  filtered.forEach((item, i) => columns[i % COL_COUNT].push(item));

  const bannerW = SCREEN_W - PADDING * 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 顶部导航 */}
      <View style={[styles.navBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[styles.logo, { color: colors.accent }]}>🧩</Text>
        <Text style={[styles.logoText, { color: colors.text }]}>BeadForge</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.inputBg }]}
          onPress={toggle}
        >
          <Text style={styles.themeIcon}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索 + 分类 */}
      <View style={[styles.filterBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={colors.textHint}
            value={searchKeyword}
            onChangeText={handleSearch}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={{ color: colors.textHint, fontSize: 15, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navItems}>
          {NAV_ITEMS.map((name, idx) => (
            <TouchableOpacity
              key={name}
              onPress={() => setFilter(undefined, NAV_KEYS[idx] || null)}
              style={[styles.navChip, activeNav === idx && { backgroundColor: colors.accent }]}
            >
              <Text style={[
                styles.navChipText,
                { color: activeNav === idx ? '#FFF' : colors.textSecondary },
              ]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 内容区 */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Banner 轮播 */}
        <View style={styles.bannerSection}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={bannerW + GAP}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (bannerW + GAP)))}
            contentContainerStyle={{ paddingHorizontal: PADDING }}
          >
            {BANNERS.map((b) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.9}
                style={[styles.bannerCard, { width: bannerW, backgroundColor: b.gradStart, marginRight: GAP }]}
              >
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerDesc}>{b.desc}</Text>
                  <View style={styles.bannerBtn}>
                    <Text style={styles.bannerBtnText}>查看全部 →</Text>
                  </View>
                </View>
                <View style={styles.bannerRight}>
                  <View style={styles.bannerArtWrap}>
                    <BeadGrid pixels={ALL_PATTERNS[b.patIdx]} beadSize={10} gap={1.5} round />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: bannerIdx === i ? colors.accent : colors.border }]} />
            ))}
          </View>
        </View>

        {/* 标题 */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>作品广场</Text>
          <Text style={[styles.sectionCount, { color: colors.textHint }]}>
            {filtered.length > 0 ? `${filtered.length} 个作品` : ''}
          </Text>
        </View>

        {/* 状态 */}
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {/* 瀑布流 */}
        {filtered.length > 0 && (
          <View style={styles.grid}>
            {columns.map((col, ci) => (
              <View key={ci} style={styles.column}>
                {col.map((item) => (
                  <GalleryCard key={item.id} item={item} />
                ))}
              </View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={[styles.endText, { color: colors.textHint }]}>— 已加载全部 —</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 回顶部 */}
      {showTop && (
        <TouchableOpacity
          style={[styles.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>↑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/** 画廊卡片 */
const GalleryCard = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const pattern = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const cardH = 120 + (item.id * 37) % 80;
  const bgPool = dark ? CARD_BGS_DARK : CARD_BGS_LIGHT;
  const bg = bgPool[item.id % bgPool.length];
  const beadSize = Math.max(Math.floor(CARD_W / (pattern[0]?.length || 9)) - 1, 4);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.cardBg }]}
    >
      <View style={[styles.cardCover, { height: cardH, backgroundColor: bg }]}>
        <BeadGrid pixels={pattern} beadSize={beadSize} gap={1} round />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardRow}>
          <Text style={[styles.cardAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            @{item.authorName || '创作者'}
          </Text>
          <View style={styles.cardLike}>
            <Text style={{ fontSize: 10 }}>❤</Text>
            <Text style={[styles.likeNum, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={[styles.tag, { backgroundColor: colors.tagBg }]}>
            <Text style={[styles.tagText, { color: colors.tagText }]}>{item.category || '拼豆'}</Text>
          </View>
          <Text style={[styles.cardId, { color: colors.textHint }]}>#{item.id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Nav
  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PADDING, height: 48, borderBottomWidth: 1,
  },
  logo: { fontSize: 22 },
  logoText: { fontSize: FontSize.lg, fontWeight: '700', marginLeft: 6 },
  themeBtn: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  themeIcon: { fontSize: 16 },

  // Filter
  filterBar: { paddingHorizontal: PADDING, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, paddingHorizontal: 12, height: 36, marginBottom: 10,
  },
  searchIcon: { fontSize: 13, marginRight: 6, opacity: 0.6 },
  searchInput: { flex: 1, fontSize: FontSize.md, padding: 0 },
  navItems: { gap: 6 },
  navChip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  navChipText: { fontSize: FontSize.sm, fontWeight: '600' },

  // Banner
  bannerSection: { marginTop: 12, marginBottom: 4 },
  bannerCard: {
    height: 140, borderRadius: BorderRadius.lg, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingLeft: 20,
  },
  bannerLeft: { flex: 1 },
  bannerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFF' },
  bannerDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  bannerBtn: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  bannerBtnText: { fontSize: FontSize.xs, color: '#FFF', fontWeight: '600' },
  bannerRight: { width: 120, alignItems: 'center', justifyContent: 'center' },
  bannerArtWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10, borderRadius: BorderRadius.lg,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: PADDING, marginTop: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: FontSize.title, fontWeight: '700' },
  sectionCount: { fontSize: FontSize.xs },

  // Grid
  grid: { flexDirection: 'row', paddingHorizontal: PADDING, gap: GAP },
  column: { flex: 1, gap: GAP },

  // Card
  card: {
    borderRadius: BorderRadius.md, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center' },
  cardInfo: { padding: 8, paddingTop: 6 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardAuthor: { fontSize: FontSize.xs, flex: 1 },
  cardLike: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  likeNum: { fontSize: FontSize.xs },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4 },
  tagText: { fontSize: 10 },
  cardId: { fontSize: 10 },

  endText: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.lg },

  // FAB
  fabBtn: {
    position: 'absolute', right: 14, bottom: 16,
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
});
