import React, { useEffect, useCallback, useRef, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput, Animated,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView, PressableScale, CardSkeleton } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';
import { wp, fp, screenW, getColumnCount, getCardWidth, getBannerWidth, isSmall, BOTTOM_SAFE_H } from '../../utils/responsive';

const COL_COUNT = getColumnCount();
const GAP = wp(8);
const PAD = wp(12);
const CARD_W = getCardWidth(PAD, GAP, COL_COUNT);
const BANNER_W = getBannerWidth(PAD);
const BANNER_H = wp(140);
const NAV_H = wp(48);
const SEARCH_H = wp(36);
const TAB_BOTTOM = wp(74) + BOTTOM_SAFE_H;

const CARD_BGS_L = ['#FFF0F2','#FFF8ED','#EDFAFF','#F0FFF4','#FFF0FA','#FFFDE7','#F0F0FF','#FFF5EE'];
const CARD_BGS_D = ['#2A1520','#2A2518','#152028','#182A1C','#2A1528','#2A2A15','#1A1A30','#2A2018'];

const NAV_ITEMS = ['全部','动物','卡通','花卉','美食','风景','抽象','像素'];
const NAV_KEYS = ['','animal','character','flower','food','scenery','abstract','pixel'];

const BANNERS = [
  { id: 1, title: '热门精选', desc: '本周最受欢迎的拼豆图案', pi: 0, c1: '#FF6B6B', c2: '#E55555' },
  { id: 2, title: '可爱萌宠', desc: '人气动物系列合集', pi: 1, c1: '#FFA726', c2: '#E08600' },
  { id: 3, title: '像素经典', desc: '游戏角色完美还原', pi: 2, c1: '#42A5F5', c2: '#1E88E5' },
  { id: 4, title: '花之物语', desc: '春日限定花卉图案', pi: 3, c1: '#AB47BC', c2: '#8E24AA' },
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
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const bannerRef = useRef<ScrollView>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const activeNav = NAV_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (BANNER_W + GAP), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.spring(fabAnim, { toValue: showTop ? 1 : 0, useNativeDriver: true, speed: 20 }).start();
  }, [showTop, fabAnim]);

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

  const isFirstLoad = loading && designs.length === 0;
  const beadSizeBanner = isSmall ? 8 : wp(10);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 导航 */}
      <View style={[styles.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[styles.logo, { color: colors.accent }]}>🧩</Text>
        <Text style={[styles.logoText, { color: colors.text }]}>BeadForge</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.themeBtn, { backgroundColor: colors.inputBg }]} onPress={toggle}>
          <Text style={{ fontSize: fp(15) }}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索 */}
      <View style={[styles.searchBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={[
          styles.searchBox,
          { backgroundColor: colors.inputBg },
          searchFocused && { borderColor: colors.accent, borderWidth: 1.5 },
        ]}>
          <Text style={[styles.searchIcon, { opacity: searchFocused ? 1 : 0.5 }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={colors.textHint}
            value={searchKeyword}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
              <View style={[styles.clearCircle, { backgroundColor: colors.textHint }]}>
                <Text style={styles.clearX}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={60}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Banner */}
        <View style={styles.bannerArea}>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_W + GAP} decelerationRate="fast"
            onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + GAP)))}
            contentContainerStyle={{ paddingHorizontal: PAD }}
          >
            {BANNERS.map((b) => (
              <PressableScale key={b.id} style={[styles.banner, { width: BANNER_W, backgroundColor: b.c1, marginRight: GAP }]}>
                <View style={[StyleSheet.absoluteFill, styles.bannerGrad, { backgroundColor: b.c2, opacity: 0.4 }]} />
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerDesc}>{b.desc}</Text>
                  <View style={styles.bannerBtn}>
                    <Text style={styles.bannerBtnText}>查看全部 →</Text>
                  </View>
                </View>
                <View style={styles.bannerRight}>
                  <View style={styles.bannerArt}>
                    <BeadGrid pixels={ALL_PATTERNS[b.pi]} beadSize={beadSizeBanner} gap={wp(1.5)} round />
                  </View>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                { backgroundColor: bannerIdx === i ? colors.accent : colors.border },
                bannerIdx === i && styles.dotActive,
              ]} />
            ))}
          </View>
        </View>

        {/* 分类 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {NAV_ITEMS.map((name, idx) => {
            const active = activeNav === idx;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => setFilter(undefined, NAV_KEYS[idx] || null)}
                style={[styles.chip, { backgroundColor: active ? colors.accent : colors.inputBg }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : colors.textSecondary }]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 标题 */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.countText, { color: colors.accent }]}>{filtered.length}</Text>
            </View>
          )}
        </View>

        {isFirstLoad && (
          <View style={styles.grid}>
            {Array.from({ length: COL_COUNT }).map((_, ci) => (
              <View key={ci} style={styles.column}>
                {[0,1,2].map((j) => <CardSkeleton key={j} height={wp(140 + j * 30)} />)}
              </View>
            ))}
          </View>
        )}

        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {filtered.length > 0 && (
          <View style={styles.grid}>
            {columns.map((col, ci) => (
              <View key={ci} style={styles.column}>
                {col.map((item) => <GalleryCard key={item.id} item={item} />)}
              </View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={[styles.endText, { color: colors.textHint }]}>— 已加载全部 {filtered.length} 个作品 —</Text>
        )}
        <View style={{ height: TAB_BOTTOM }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, {
        bottom: TAB_BOTTOM + wp(8),
        opacity: fabAnim,
        transform: [{ scale: fabAnim }, { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
        <TouchableOpacity
          style={[styles.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          activeOpacity={0.7}
        >
          <Text style={[styles.fabIcon, { color: colors.textSecondary }]}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const GalleryCard = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const pattern = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const cardH = wp(120) + (item.id * 37) % wp(80);
  const bg = (dark ? CARD_BGS_D : CARD_BGS_L)[item.id % CARD_BGS_L.length];
  const beadSize = Math.max(Math.floor(CARD_W / (pattern[0]?.length || 9)) - 1, wp(4));

  return (
    <PressableScale style={[styles.card, { backgroundColor: colors.cardBg }]} scale={0.96}>
      <View style={[styles.cardCover, { height: cardH, backgroundColor: bg }]}>
        <BeadGrid pixels={pattern} beadSize={beadSize} gap={1} round />
        <View style={styles.cardGrad} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardRow}>
          <Text style={[styles.cardAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            @{item.authorName || '创作者'}
          </Text>
          <View style={styles.cardLike}>
            <Text style={{ fontSize: fp(10) }}>❤</Text>
            <Text style={[styles.likeNum, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={[styles.tag, { backgroundColor: colors.tagBg }]}>
            <Text style={[styles.tagT, { color: colors.tagText }]}>{item.category || '拼豆'}</Text>
          </View>
          <Text style={[styles.cardId, { color: colors.textHint }]}>#{item.id}</Text>
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },

  nav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, height: NAV_H, borderBottomWidth: 1,
  },
  logo: { fontSize: fp(22) },
  logoText: { fontSize: FontSize.lg, fontWeight: '700', marginLeft: wp(6) },
  themeBtn: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center' },

  searchBar: { paddingHorizontal: PAD, paddingTop: wp(8), paddingBottom: wp(10), borderBottomWidth: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, paddingHorizontal: wp(12), height: SEARCH_H,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  searchIcon: { fontSize: fp(13), marginRight: wp(6) },
  searchInput: { flex: 1, fontSize: FontSize.md, padding: 0 },
  clearBtn: { padding: wp(2) },
  clearCircle: { width: wp(18), height: wp(18), borderRadius: wp(9), justifyContent: 'center', alignItems: 'center' },
  clearX: { fontSize: fp(10), color: '#FFF', fontWeight: '700' },

  bannerArea: { marginTop: wp(12), marginBottom: wp(4) },
  banner: {
    height: BANNER_H, borderRadius: BorderRadius.lg, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingLeft: wp(20),
  },
  bannerGrad: { borderTopRightRadius: 200, borderBottomLeftRadius: 200 },
  bannerLeft: { flex: 1, zIndex: 1 },
  bannerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFF' },
  bannerDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: wp(4) },
  bannerBtn: {
    alignSelf: 'flex-start', marginTop: wp(12),
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: wp(14), paddingVertical: wp(5),
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerBtnText: { fontSize: FontSize.xs, color: '#FFF', fontWeight: '600' },
  bannerRight: { width: wp(120), alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  bannerArt: { backgroundColor: 'rgba(255,255,255,0.15)', padding: wp(10), borderRadius: BorderRadius.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(10), gap: wp(5) },
  dot: { width: wp(6), height: wp(6), borderRadius: wp(3) },
  dotActive: { width: wp(20), borderRadius: wp(3) },

  chips: { gap: wp(6), paddingHorizontal: PAD, paddingVertical: wp(12) },
  chip: { paddingHorizontal: wp(14), paddingVertical: wp(5), borderRadius: BorderRadius.full },
  chipText: { fontSize: FontSize.sm, fontWeight: '600' },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, marginBottom: wp(10), gap: wp(8),
  },
  sectionTitle: { fontSize: FontSize.title, fontWeight: '700' },
  countBadge: { paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: BorderRadius.full },
  countText: { fontSize: FontSize.xs, fontWeight: '700' },

  grid: { flexDirection: 'row', paddingHorizontal: PAD, gap: GAP },
  column: { flex: 1, gap: GAP },

  card: {
    borderRadius: BorderRadius.md, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: wp(30),
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  cardInfo: { padding: wp(8), paddingTop: wp(6) },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: wp(3) },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) },
  cardAuthor: { fontSize: FontSize.xs, flex: 1 },
  cardLike: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  likeNum: { fontSize: FontSize.xs },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: wp(6), paddingVertical: wp(1.5), borderRadius: wp(4) },
  tagT: { fontSize: fp(10) },
  cardId: { fontSize: fp(10) },

  endText: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.lg },

  fab: { position: 'absolute', right: wp(14) },
  fabBtn: {
    width: wp(40), height: wp(40), borderRadius: wp(20),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  fabIcon: { fontSize: fp(16), fontWeight: '700' },
});
