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

const COL = getColumnCount();
const GAP = wp(10);
const PAD = wp(14);
const CARD_W = getCardWidth(PAD, GAP, COL);
const BW = getBannerWidth(PAD);
const TAB_H = wp(74) + BOTTOM_SAFE_H;

const BG_L = ['#FFF0F2','#FFF6EC','#EBF5FF','#EEFAF2','#FFF0FA','#FFFDE7','#EEEEFF','#FFF5EE'];
const BG_D = ['#281520','#282218','#132030','#152A1C','#281528','#28280F','#181830','#282018'];

const CATS = [
  { key: '', label: '全部', emoji: '✨' },
  { key: 'animal', label: '动物', emoji: '🐱' },
  { key: 'character', label: '卡通', emoji: '🎮' },
  { key: 'flower', label: '花卉', emoji: '🌸' },
  { key: 'food', label: '美食', emoji: '🍰' },
  { key: 'scenery', label: '风景', emoji: '🌈' },
  { key: 'abstract', label: '抽象', emoji: '💎' },
  { key: 'pixel', label: '像素', emoji: '👾' },
];

const BANNERS = [
  { id: 1, title: '热门精选', sub: '本周最受欢迎的拼豆图案', pi: 0, bg: '#6366F1', bgD: '#4338CA' },
  { id: 2, title: '可爱萌宠', sub: '人气动物系列', pi: 1, bg: '#F97316', bgD: '#C2410C' },
  { id: 3, title: '像素经典', sub: '经典游戏角色还原', pi: 2, bg: '#0EA5E9', bgD: '#0369A1' },
  { id: 4, title: '花之物语', sub: '春日限定花卉系列', pi: 3, bg: '#D946EF', bgD: '#A21CAF' },
];

export const HomeScreen: React.FC = () => {
  const { colors, dark, toggle } = useTheme();
  const {
    designs, loading, refreshing, error, hasMore, category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const bannerRef = useRef<ScrollView>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const activeCat = CATS.findIndex((c) => c.key === (category || ''));

  useEffect(() => { fetchDesigns(true); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((p) => {
        const n = (p + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: n * (BW + GAP), animated: true });
        return n;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.spring(fabAnim, { toValue: showTop ? 1 : 0, useNativeDriver: true, speed: 20 }).start();
  }, [showTop]);

  const onRefresh = useCallback(() => fetchDesigns(true), []);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowTop(y > 300);
    const { layoutMeasurement, contentSize } = e.nativeEvent;
    if (y + layoutMeasurement.height >= contentSize.height - 200 && hasMore && !loading) fetchDesigns(false);
  }, [hasMore, loading]);

  const handleSearch = useCallback((t: string) => {
    setSearchKeyword(t);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, []);

  const filtered = searchKeyword.trim()
    ? designs.filter((d) => d.title.includes(searchKeyword.trim()) || d.description?.includes(searchKeyword.trim()))
    : designs;

  const cols: DesignItem[][] = Array.from({ length: COL }, () => []);
  filtered.forEach((item, i) => cols[i % COL].push(item));
  const isFirstLoad = loading && designs.length === 0;
  const beadBanner = isSmall ? 8 : wp(11);

  return (
    <SafeAreaView style={[S.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* —— 顶部区 —— */}
      <View style={[S.header, { backgroundColor: colors.navBg }]}>
        {/* Logo + 主题切换 */}
        <View style={S.headerRow}>
          <View style={S.logoWrap}>
            <Text style={S.logoEmoji}>🧩</Text>
            <View>
              <Text style={[S.logoName, { color: colors.text }]}>BeadForge</Text>
              <Text style={[S.logoSub, { color: colors.textHint }]}>拼豆创作平台</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[S.themeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={toggle}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: fp(16) }}>{dark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* 搜索框 */}
        <View style={[S.searchBox, { backgroundColor: colors.inputBg }, searchFocused && { borderColor: colors.accent }]}>
          <Text style={[S.searchIcon, { color: searchFocused ? colors.accent : colors.textHint }]}>🔍</Text>
          <TextInput
            style={[S.searchInput, { color: colors.text }]}
            placeholder="搜索图案、作者..."
            placeholderTextColor={colors.textHint}
            value={searchKeyword}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <View style={[S.clearBtn, { backgroundColor: colors.textHint }]}>
                <Text style={S.clearX}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* —— 内容区 —— */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={60}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Banner 轮播 */}
        <View style={S.bannerWrap}>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            snapToInterval={BW + GAP} decelerationRate="fast"
            onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (BW + GAP)))}
            contentContainerStyle={{ paddingHorizontal: PAD }}
          >
            {BANNERS.map((b) => (
              <PressableScale key={b.id} style={[S.banner, { width: BW, marginRight: GAP }]}>
                {/* 双色背景 */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: b.bg, borderRadius: wp(16) }]} />
                <View style={[S.bannerAccent, { backgroundColor: b.bgD }]} />
                {/* 文字 */}
                <View style={S.bannerText}>
                  <View style={S.bannerBadge}>
                    <Text style={S.bannerBadgeT}>HOT</Text>
                  </View>
                  <Text style={S.bannerTitle}>{b.title}</Text>
                  <Text style={S.bannerSub}>{b.sub}</Text>
                </View>
                {/* 拼豆图案 */}
                <View style={S.bannerArt}>
                  <View style={S.bannerArtInner}>
                    <BeadGrid pixels={ALL_PATTERNS[b.pi]} beadSize={beadBanner} gap={wp(1.5)} round />
                  </View>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
          {/* 指示器 */}
          <View style={S.dots}>
            {BANNERS.map((_, i) => (
              <Animated.View key={i} style={[
                S.dot,
                { backgroundColor: bannerIdx === i ? colors.accent : colors.border },
                bannerIdx === i && S.dotActive,
              ]} />
            ))}
          </View>
        </View>

        {/* 分类标签 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.catRow}>
          {CATS.map((c, idx) => {
            const on = activeCat === idx;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setFilter(undefined, c.key || null)}
                style={[S.catChip, {
                  backgroundColor: on ? colors.accent : colors.surface,
                  borderColor: on ? colors.accent : colors.border,
                }]}
                activeOpacity={0.7}
              >
                <Text style={S.catEmoji}>{c.emoji}</Text>
                <Text style={[S.catLabel, { color: on ? '#FFF' : colors.textSecondary }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 作品广场 标题 */}
        <View style={S.sectionRow}>
          <View style={[S.sectionDot, { backgroundColor: colors.accent }]} />
          <Text style={[S.sectionTitle, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && (
            <View style={[S.badge, { backgroundColor: colors.accentLight }]}>
              <Text style={[S.badgeT, { color: colors.accent }]}>{filtered.length}</Text>
            </View>
          )}
        </View>

        {/* 骨架屏 */}
        {isFirstLoad && (
          <View style={S.grid}>
            {Array.from({ length: COL }).map((_, ci) => (
              <View key={ci} style={S.col}>
                {[0,1,2].map((j) => <CardSkeleton key={j} height={wp(130 + j * 28)} />)}
              </View>
            ))}
          </View>
        )}

        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {/* 瀑布流 */}
        {filtered.length > 0 && (
          <View style={S.grid}>
            {cols.map((col, ci) => (
              <View key={ci} style={S.col}>
                {col.map((item) => <Card key={item.id} item={item} />)}
              </View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={[S.endT, { color: colors.textHint }]}>— 已全部加载 —</Text>
        )}
        <View style={{ height: TAB_H }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[S.fab, {
        bottom: TAB_H + wp(6),
        opacity: fabAnim,
        transform: [{ scale: fabAnim }, { translateY: fabAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }],
      }]}>
        <TouchableOpacity
          style={[S.fabBtn, { backgroundColor: colors.accent }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          activeOpacity={0.8}
        >
          <Text style={S.fabIcon}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

/** ---- 卡片 ---- */
const Card = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const pat = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const h = wp(115) + (item.id * 37) % wp(75);
  const bg = (dark ? BG_D : BG_L)[item.id % BG_L.length];
  const bs = Math.max(Math.floor(CARD_W / (pat[0]?.length || 9)) - 1, wp(4));

  return (
    <PressableScale style={[S.card, { backgroundColor: colors.cardBg }]} scale={0.97}>
      <View style={[S.cardCover, { height: h, backgroundColor: bg }]}>
        <BeadGrid pixels={pat} beadSize={bs} gap={1} round />
      </View>
      <View style={S.cardBody}>
        <Text style={[S.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[S.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{item.description}</Text>
        <View style={S.cardFooter}>
          <View style={[S.cardAvatar, { backgroundColor: colors.accent + '20' }]}>
            <Text style={{ fontSize: fp(9), color: colors.accent }}>
              {(item.authorName || '?').charAt(0)}
            </Text>
          </View>
          <Text style={[S.cardAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.authorName || '创作者'}
          </Text>
          <Text style={[S.cardLike, { color: colors.textHint }]}>❤ {item.likeCount}</Text>
        </View>
      </View>
    </PressableScale>
  );
});

/** ---- Styles ---- */
const S = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { paddingHorizontal: PAD, paddingTop: wp(6), paddingBottom: wp(12) },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(12) },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
  logoEmoji: { fontSize: fp(28) },
  logoName: { fontSize: fp(18), fontWeight: '800', letterSpacing: 0.3 },
  logoSub: { fontSize: fp(10), marginTop: 1 },
  themeBtn: {
    width: wp(38), height: wp(38), borderRadius: wp(12),
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(42), borderRadius: wp(12), paddingHorizontal: wp(14),
    borderWidth: 1.5, borderColor: 'transparent',
  },
  searchIcon: { fontSize: fp(14), marginRight: wp(8) },
  searchInput: { flex: 1, fontSize: FontSize.md, padding: 0 },
  clearBtn: {
    width: wp(20), height: wp(20), borderRadius: wp(10),
    justifyContent: 'center', alignItems: 'center',
  },
  clearX: { fontSize: fp(10), color: '#FFF', fontWeight: '800' },

  // Banner
  bannerWrap: { marginBottom: wp(4) },
  banner: {
    height: wp(150), borderRadius: wp(16), overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
  },
  bannerAccent: {
    position: 'absolute', right: -wp(30), top: -wp(30),
    width: wp(180), height: wp(180), borderRadius: wp(90), opacity: 0.35,
  },
  bannerText: { flex: 1, paddingLeft: wp(20), zIndex: 1 },
  bannerBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: wp(10), paddingVertical: wp(3), borderRadius: wp(6), marginBottom: wp(8),
  },
  bannerBadgeT: { fontSize: fp(9), color: '#FFF', fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { fontSize: fp(22), fontWeight: '800', color: '#FFF' },
  bannerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.8)', marginTop: wp(4), lineHeight: fp(18) },
  bannerArt: { width: wp(130), alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  bannerArtInner: {
    backgroundColor: 'rgba(255,255,255,0.15)', padding: wp(12),
    borderRadius: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(12), gap: wp(6) },
  dot: { width: wp(6), height: wp(6), borderRadius: wp(3) },
  dotActive: { width: wp(22) },

  // Categories
  catRow: { paddingHorizontal: PAD, paddingVertical: wp(10), gap: wp(8) },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(14), paddingVertical: wp(8),
    borderRadius: wp(12), borderWidth: 1.5,
  },
  catEmoji: { fontSize: fp(14) },
  catLabel: { fontSize: FontSize.sm, fontWeight: '600' },

  // Section
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    paddingHorizontal: PAD, marginTop: wp(4), marginBottom: wp(12),
  },
  sectionDot: { width: wp(4), height: wp(18), borderRadius: wp(2) },
  sectionTitle: { fontSize: fp(18), fontWeight: '700', flex: 1 },
  badge: { paddingHorizontal: wp(10), paddingVertical: wp(3), borderRadius: wp(10) },
  badgeT: { fontSize: fp(11), fontWeight: '700' },

  // Grid
  grid: { flexDirection: 'row', paddingHorizontal: PAD, gap: GAP },
  col: { flex: 1, gap: GAP },

  // Card
  card: {
    borderRadius: wp(12), overflow: 'hidden',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: wp(10) },
  cardTitle: { fontSize: fp(13), fontWeight: '700', marginBottom: wp(2) },
  cardDesc: { fontSize: fp(10), marginBottom: wp(8), lineHeight: fp(15) },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardAvatar: {
    width: wp(20), height: wp(20), borderRadius: wp(10),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(5),
  },
  cardAuthor: { fontSize: fp(10), flex: 1 },
  cardLike: { fontSize: fp(10) },

  endT: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.lg },

  fab: { position: 'absolute', right: wp(14) },
  fabBtn: {
    width: wp(44), height: wp(44), borderRadius: wp(14),
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  fabIcon: { fontSize: fp(18), color: '#FFF', fontWeight: '800' },
});
