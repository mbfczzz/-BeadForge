import React, { useEffect, useCallback, useRef, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput, Animated,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView, PressableScale, CardSkeleton } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';
import { wp, fp, screenW, getColumnCount, getCardWidth, getBannerWidth, isSmall, BOTTOM_SAFE_H } from '../../utils/responsive';

const COL = getColumnCount();
const GAP = wp(12);
const PAD = wp(16);
const CARD_W = getCardWidth(PAD, GAP, COL);
const BW = getBannerWidth(PAD);
const TAB_H = wp(65) + BOTTOM_SAFE_H;

const BG_L = ['#FEF1F2','#FEF6EC','#EBF5FF','#ECFDF5','#FDF2F8','#FFFBEB','#EEF2FF','#FFF7ED'];
const BG_D = ['#2A1822','#2A2418','#152030','#15261C','#2A1530','#2A2810','#1A1A35','#2A2018'];

const CATS = ['全部','动物','卡通','花卉','美食','风景','抽象','像素'];
const CAT_KEYS = ['','animal','character','flower','food','scenery','abstract','pixel'];

const BANNERS = [
  { id: 1, title: '热门精选', sub: '本周最受欢迎的拼豆图案', pi: 0, bg: '#6366F1' },
  { id: 2, title: '可爱萌宠', sub: '人气动物系列合集', pi: 1, bg: '#F97316' },
  { id: 3, title: '像素经典', sub: '游戏角色完美还原', pi: 2, bg: '#0EA5E9' },
  { id: 4, title: '花之物语', sub: '春日花卉图案', pi: 3, bg: '#D946EF' },
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
  const activeCat = CAT_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((p) => { const n = (p+1)%BANNERS.length; bannerRef.current?.scrollTo({ x: n*(BW+GAP), animated: true }); return n; });
    }, 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { Animated.spring(fabAnim, { toValue: showTop?1:0, useNativeDriver: true, speed: 20 }).start(); }, [showTop]);

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
    ? designs.filter((d) => d.title.includes(searchKeyword.trim()))
    : designs;
  const cols: DesignItem[][] = Array.from({ length: COL }, () => []);
  filtered.forEach((item, i) => cols[i % COL].push(item));
  const isFirstLoad = loading && designs.length === 0;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 顶部 */}
      <View style={[$.header, { backgroundColor: colors.navBg }]}>
        <View style={$.headerTop}>
          <Text style={[$.logoT, { color: colors.text }]}>BeadForge</Text>
          <TouchableOpacity style={[$.iconBtn, { backgroundColor: colors.inputBg }]} onPress={toggle}>
            <Feather name={dark ? 'sun' : 'moon'} size={wp(18)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={[$.searchBox, { backgroundColor: colors.inputBg }, searchFocused && { borderColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.15, shadowRadius: 8 }]}>
          <Feather name="search" size={wp(16)} color={searchFocused ? colors.accent : colors.textHint} />
          <TextInput
            style={[$.searchInput, { color: colors.text }]}
            placeholder="搜索图案"
            placeholderTextColor={colors.textHint}
            value={searchKeyword}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={wp(16)} color={colors.textHint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={60}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Banner */}
        <ScrollView ref={bannerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          snapToInterval={BW+GAP} decelerationRate="fast"
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (BW+GAP)))}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: wp(16) }}
        >
          {BANNERS.map((b) => (
            <PressableScale key={b.id} style={[$.banner, { width: BW, backgroundColor: b.bg, marginRight: GAP }]}>
              <View style={$.bannerContent}>
                <Text style={$.bannerTitle}>{b.title}</Text>
                <Text style={$.bannerSub}>{b.sub}</Text>
                <View style={$.bannerTag}>
                  <Text style={$.bannerTagT}>查看 →</Text>
                </View>
              </View>
              <View style={$.bannerArt}>
                <BeadGrid pixels={ALL_PATTERNS[b.pi]} beadSize={isSmall ? 7 : wp(9)} gap={wp(1.5)} round glossy={false} />
              </View>
            </PressableScale>
          ))}
        </ScrollView>
        <View style={$.dots}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[$.dot, { backgroundColor: bannerIdx===i ? colors.accent : colors.border }, bannerIdx===i && $.dotOn]} />
          ))}
        </View>

        {/* 分类 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={$.catRow}>
          {CATS.map((name, idx) => {
            const on = activeCat === idx;
            return (
              <TouchableOpacity key={name} onPress={() => setFilter(undefined, CAT_KEYS[idx] || null)} activeOpacity={0.7}
                style={[$.catChip, { backgroundColor: on ? colors.accent : colors.surface }]}>
                <Text style={[$.catT, { color: on ? '#FFF' : colors.textSecondary }]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 作品广场 */}
        <View style={$.secRow}>
          <Text style={[$.secTitle, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && <Text style={[$.secCount, { color: colors.textHint }]}>{filtered.length} 个作品</Text>}
        </View>

        {isFirstLoad && (
          <View style={$.grid}>
            {Array.from({ length: COL }).map((_, ci) => (
              <View key={ci} style={$.col}>{[0,1,2].map((j) => <CardSkeleton key={j} height={wp(130+j*28)} />)}</View>
            ))}
          </View>
        )}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {filtered.length > 0 && (
          <View style={$.grid}>
            {cols.map((col, ci) => (
              <View key={ci} style={$.col}>{col.map((item) => <Card key={item.id} item={item} />)}</View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && <Text style={[$.endT, { color: colors.textHint }]}>— 到底了 —</Text>}
        <View style={{ height: TAB_H }} />
      </ScrollView>

      <Animated.View style={[$.fab, { bottom: TAB_H+wp(6), opacity: fabAnim, transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity style={[$.fabBtn, { backgroundColor: colors.accent }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} activeOpacity={0.8}>
          <Feather name="arrow-up" size={wp(18)} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const Card = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const pat = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const h = wp(110) + (item.id * 31) % wp(70);
  const bg = (dark ? BG_D : BG_L)[item.id % BG_L.length];
  const bs = Math.max(Math.floor(CARD_W / (pat[0]?.length || 9)) - 1, wp(4));

  return (
    <PressableScale style={[$.card, { backgroundColor: colors.cardBg }]} scale={0.96}>
      <View style={[$.cardCover, { height: h, backgroundColor: bg }]}>
        <BeadGrid pixels={pat} beadSize={bs} gap={1} round />
      </View>
      <View style={$.cardBody}>
        <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={$.cardMeta}>
          <Text style={[$.cardAuthor, { color: colors.textHint }]}>
            {item.authorName || '创作者'}
          </Text>
          <View style={$.likeRow}>
            <Feather name="heart" size={wp(11)} color={colors.textHint} />
            <Text style={[$.likeN, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

/**
 * 8pt 网格间距系统:
 * 8  - 元素内部紧凑间距
 * 16 - 元素间标准间距
 * 24 - 区块间间距
 * 32 - 大区块分隔
 */
const $ = StyleSheet.create({
  root: { flex: 1 },

  // ---- 顶部区 ----
  header: { paddingHorizontal: PAD, paddingTop: wp(12), paddingBottom: wp(16) },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: wp(16),
  },
  logoT: { fontSize: fp(22), fontWeight: '800', letterSpacing: -0.5 },
  iconBtn: {
    width: wp(40), height: wp(40), borderRadius: wp(20),
    justifyContent: 'center', alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: wp(10),
    height: wp(44), borderRadius: wp(22), paddingHorizontal: wp(16),
    borderWidth: 1.5, borderColor: 'transparent',
  },
  searchInput: { flex: 1, fontSize: fp(14), padding: 0 },

  // ---- Banner 轮播 ----
  banner: {
    height: wp(150), borderRadius: wp(20), overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(24),
  },
  bannerContent: { flex: 1, zIndex: 1 },
  bannerTitle: { fontSize: fp(21), fontWeight: '800', color: '#FFF' },
  bannerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.75)', marginTop: wp(6), lineHeight: fp(18) },
  bannerTag: {
    alignSelf: 'flex-start', marginTop: wp(16),
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: wp(16), paddingVertical: wp(8),
    borderRadius: wp(16),
  },
  bannerTagT: { fontSize: fp(12), color: '#FFF', fontWeight: '600' },
  bannerArt: {
    width: wp(110), alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', padding: wp(12), borderRadius: wp(16),
    marginLeft: wp(12),
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(16), gap: wp(6) },
  dot: { width: wp(6), height: wp(6), borderRadius: wp(3) },
  dotOn: { width: wp(20) },

  // ---- 分类标签 ----
  catRow: { paddingHorizontal: PAD, paddingTop: wp(20), paddingBottom: wp(8), gap: wp(8) },
  catChip: {
    paddingHorizontal: wp(18), paddingVertical: wp(8), borderRadius: wp(20),
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  catT: { fontSize: fp(13), fontWeight: '600' },

  // ---- 作品广场标题 ----
  secRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: PAD, marginTop: wp(16), marginBottom: wp(16),
  },
  secTitle: { fontSize: fp(18), fontWeight: '700' },
  secCount: { fontSize: fp(12) },

  // ---- 瀑布流网格 ----
  grid: { flexDirection: 'row', paddingHorizontal: PAD, gap: wp(12) },
  col: { flex: 1, gap: wp(12) },

  // ---- 卡片 ---- 去掉硬边框，用阴影代替
  card: {
    borderRadius: wp(16), overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: wp(12), paddingTop: wp(10) },
  cardTitle: { fontSize: fp(13), fontWeight: '600', marginBottom: wp(8) },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthor: { fontSize: fp(11) },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  likeN: { fontSize: fp(11) },

  // ---- 底部 ----
  endT: { textAlign: 'center', fontSize: fp(12), paddingVertical: wp(24) },

  // ---- FAB ----
  fab: { position: 'absolute', right: wp(16) },
  fabBtn: {
    width: wp(44), height: wp(44), borderRadius: wp(14),
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
