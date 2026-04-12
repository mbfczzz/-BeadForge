import React, { useEffect, useCallback, useRef, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput, Animated,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView, PressableScale, CardSkeleton, HoverView } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';
import { wp, fp, screenW, getColumnCount, getCardWidth, getBannerWidth, isSmall, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const COL = getColumnCount();
const GAP = wp(10);
const PAD = wp(16);
const CARD_W = getCardWidth(PAD, GAP, COL);
const BW = getBannerWidth(PAD);
const TAB_H = wp(60) + BOTTOM_SAFE_H;

const BG_L = ['#fef2f2','#fef9ee','#eef6ff','#f0fdf4','#fdf2f8','#fffbeb','#eef2ff','#fff7ed'];
const BG_D = ['#2d2025','#2d2818','#1e2838','#1e2d22','#2d1e30','#2d2c12','#1e1e38','#2d2520'];

const CATS = ['全部','动物','卡通','花卉','美食','风景','抽象','像素','节日','手办','建筑','游戏','国风'];
const CAT_KEYS = ['','animal','character','flower','food','scenery','abstract','pixel','festival','figure','building','game','chinese'];
const CAT_FOLD_LIMIT = 10;

const BANNERS = [
  { id: 1, title: '热门精选', sub: '本周最受欢迎的拼豆图案', pi: 0, bg: '#4b78ff' },
  { id: 2, title: '可爱萌宠', sub: '人气动物系列合集', pi: 1, bg: '#d6b161' },
  { id: 3, title: '像素经典', sub: '游戏角色完美还原', pi: 2, bg: '#549da5' },
  { id: 4, title: '花之物语', sub: '春日花卉图案', pi: 3, bg: '#bf60fe' },
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
  const [catExpanded, setCatExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const bannerRef = useRef<ScrollView>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const activeCat = CAT_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setBannerIdx((p) => { const n=(p+1)%BANNERS.length; bannerRef.current?.scrollTo({ x:n*(BW+wp(10)), animated:true }); return n; });
    }, 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { Animated.timing(fabAnim, { toValue: showTop?1:0, duration: 200, useNativeDriver: true }).start(); }, [showTop]);

  const onRefresh = useCallback(() => fetchDesigns(true), []);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowTop(e.nativeEvent.contentOffset.y > 300);
    const { layoutMeasurement, contentSize, contentOffset } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200 && hasMore && !loading) fetchDesigns(false);
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
      {/* 导航栏 */}
      <View style={[$.nav, { backgroundColor: colors.navBg }]}>
        <Text style={[$.navTitle, { color: colors.text }]}>BeadForge</Text>
        <View style={{ flex: 1 }} />
        <HoverView onPress={toggle} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0} dataClass="nav-btn">
          <Icon name={dark ? 'white-balance-sunny' : 'moon-waning-crescent'} size={fp(20)} color={colors.textSecondary} />
        </HoverView>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textHint} />}>

        {/* 搜索栏 */}
        <View style={{ paddingHorizontal: PAD, paddingTop: wp(12), paddingBottom: wp(8) }}>
          <View {...{ dataSet: { class: 'search' } } as any} style={[$.search, { backgroundColor: colors.surface, borderColor: searchFocused ? colors.accent : colors.border }]}>
            <Icon name="magnify" size={fp(20)} color={colors.textHint} style={{ marginRight: wp(8) }} />
            <TextInput style={[$.searchInput, { color: colors.text }]} placeholder="搜索拼豆图案..."
              placeholderTextColor={colors.textHint} value={searchKeyword} onChangeText={handleSearch}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}><Icon name="close-circle-outline" size={fp(18)} color={colors.textHint} /></TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banner */}
        <ScrollView ref={bannerRef} horizontal showsHorizontalScrollIndicator={false}
          snapToInterval={BW + wp(10)} decelerationRate="fast"
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (BW + wp(10))))}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: wp(12), gap: wp(10) }}>
          {BANNERS.map((b) => (
            <HoverView key={b.id} hoverScale={1.015} hoverLift={4} style={[$.banner, { width: BW, backgroundColor: b.bg }]} dataClass="banner">
              <View style={$.bannerInner}>
                <Text style={$.bannerT}>{b.title}</Text>
                <Text style={$.bannerS}>{b.sub}</Text>
              </View>
              <View style={$.bannerArt}>
                <BeadGrid pixels={ALL_PATTERNS[b.pi]} beadSize={isSmall?7:wp(8)} gap={wp(1)} round glossy={false} />
              </View>
            </HoverView>
          ))}
        </ScrollView>
        <View style={$.dots}>
          {BANNERS.map((_,i) => <View key={i} style={[$.dot, { backgroundColor: bannerIdx===i ? colors.text : colors.border }, bannerIdx===i && $.dotOn]} />)}
        </View>

        {/* 分类标签 - 超过10个折叠 */}
        <View style={$.catWrap}>
          {(catExpanded ? CATS : CATS.slice(0, CAT_FOLD_LIMIT)).map((name, idx) => {
            const on = activeCat === idx;
            return (
              <HoverView key={name} onPress={() => setFilter(undefined, CAT_KEYS[idx] || null)}
                hoverScale={1.05} hoverLift={1} dataClass="cat"
                style={[$.cat, { backgroundColor: on ? colors.text : colors.surface, borderColor: on ? colors.text : colors.border }]}>
                <Text style={[$.catT, { color: on ? '#fff' : colors.textSecondary }]}>{name}</Text>
              </HoverView>
            );
          })}
          {CATS.length > CAT_FOLD_LIMIT && (
            <HoverView onPress={() => setCatExpanded(!catExpanded)} hoverScale={1.05} hoverLift={1} dataClass="cat"
              style={[$.cat, $.catToggle, { borderColor: colors.border }]}>
              <Text style={[$.catT, { color: colors.textHint }]}>{catExpanded ? '收起' : `展开 +${CATS.length - CAT_FOLD_LIMIT}`}</Text>
              <Icon name={catExpanded ? 'chevron-up' : 'chevron-down'} size={fp(16)} color={colors.textHint} style={{ marginLeft: wp(2) }} />
            </HoverView>
          )}
        </View>

        {/* 标题 */}
        <View style={$.secRow}>
          <Text style={[$.secT, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && <Text style={[$.secN, { color: colors.textHint }]}>{filtered.length} 个作品</Text>}
        </View>

        {/* 骨架屏 */}
        {isFirstLoad && (
          <View style={$.grid}>
            {Array.from({ length: COL }).map((_,ci) => (
              <View key={ci} style={$.col}>{[0,1,2].map((j) => <CardSkeleton key={j} height={wp(120+j*25)} />)}</View>
            ))}
          </View>
        )}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {/* 瀑布流 */}
        {filtered.length > 0 && (
          <View style={$.grid}>
            {cols.map((col,ci) => (
              <View key={ci} style={$.col}>{col.map((item) => <Card key={item.id} item={item} />)}</View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && <Text style={[$.endT, { color: colors.textHint }]}>— 到底了 —</Text>}
        <View style={{ height: TAB_H }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[$.fab, { bottom: TAB_H+wp(10), opacity: fabAnim, transform: [{ translateY: fabAnim.interpolate({ inputRange:[0,1], outputRange:[wp(20),0] }) }] }]}>
        <HoverView style={[$.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => scrollRef.current?.scrollTo({ y:0, animated:true })} hoverScale={1.12} hoverLift={2} dataClass="fab">
          <Icon name="arrow-up" size={fp(20)} color={colors.textSecondary} />
        </HoverView>
      </Animated.View>
    </SafeAreaView>
  );
};

/** 画廊卡片 - moely 风格：小圆角+细边框+淡阴影 */
const Card = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const pat = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const h = wp(100) + (item.id * 31) % wp(60);
  const bg = (dark ? BG_D : BG_L)[item.id % BG_L.length];
  const bs = Math.max(Math.floor(CARD_W / (pat[0]?.length||9)) - 1, wp(3));

  return (
    <PressableScale onPress={() => {}} style={[$.card, { backgroundColor: colors.cardBg }]} scale={0.98} dataClass="card">
      <View style={[$.cardCover, { height: h, backgroundColor: bg }]}>
        <BeadGrid pixels={pat} beadSize={bs} gap={1} round />
      </View>
      <View style={$.cardBody}>
        <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={$.cardMeta}>
          <Text style={[$.cardAuthor, { color: colors.textHint }]}>{item.authorName || '创作者'}</Text>
          <View style={$.likeRow}>
            <Icon name="heart-outline" size={fp(14)} color={colors.textHint} />
            <Text style={[$.likeN, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },

  // 导航栏 - 无硬线，用 shadow 过渡
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(48), paddingHorizontal: PAD,
    ...shadow(0, 1, 0.04, '#000', 1),
  },
  navTitle: { fontSize: fp(20), fontWeight: '800', letterSpacing: -0.5 },
  navBtn: {
    width: wp(36), height: wp(36), borderRadius: wp(18),
    justifyContent: 'center', alignItems: 'center',
  },

  // 搜索 - 默认无边框，focus 时才显示
  search: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(44), borderRadius: BorderRadius.md, paddingHorizontal: wp(14),
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: fp(14), padding: 0, letterSpacing: 0.1 },

  // Banner
  banner: {
    height: wp(130), borderRadius: wp(16), overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(24),
  },
  bannerInner: { flex: 1, zIndex: 1 },
  bannerT: { fontSize: fp(21), fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  bannerS: { fontSize: fp(13), color: 'rgba(255,255,255,0.85)', marginTop: wp(6), lineHeight: fp(18) },
  bannerArt: {
    backgroundColor: 'rgba(255,255,255,0.15)', padding: wp(10), borderRadius: BorderRadius.md,
  },

  // 指示器
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(10), gap: wp(6) },
  dot: { width: wp(6), height: wp(6), borderRadius: wp(3), transition: 'all 0.3s' } as any,
  dotOn: { width: wp(18) },

  // 分类药丸
  catWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: PAD, paddingTop: wp(14), paddingBottom: wp(14), gap: wp(8),
  },
  cat: { paddingHorizontal: wp(14), paddingVertical: wp(7), borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  catToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  catT: { fontSize: fp(13), fontWeight: '500' },

  // 标题
  secRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: PAD, marginBottom: wp(14),
  },
  secT: { fontSize: fp(18), fontWeight: '700', letterSpacing: 0.2 },
  secN: { fontSize: fp(12) },

  // 网格 - overflow visible 防止 RN Web 默认 hidden 裁剪 hover 上浮
  grid: { flexDirection: 'row', paddingHorizontal: PAD, gap: GAP, overflow: 'visible' as any },
  col: { flex: 1, gap: GAP, overflow: 'visible' as any },

  // 卡片 - 无边框，纯阴影质感
  card: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    ...shadow(0, 4, 0.08, '#000', 3),
  },
  cardCover: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { paddingHorizontal: wp(12), paddingTop: wp(10), paddingBottom: wp(12) },
  cardTitle: { fontSize: fp(14), fontWeight: '600', marginBottom: wp(6), lineHeight: fp(20) },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthor: { fontSize: fp(12), fontWeight: '400' },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  likeN: { fontSize: fp(12) },

  endT: { textAlign: 'center', fontSize: fp(12), paddingVertical: wp(24), letterSpacing: 2 },

  // FAB
  fab: { position: 'absolute', right: PAD },
  fabBtn: {
    width: wp(42), height: wp(42), borderRadius: wp(21),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    ...shadow(2, 6, 0.1, '#000', 3),
  },
});
