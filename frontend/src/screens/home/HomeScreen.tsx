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
const GAP = wp(10);
const PAD = wp(15);
const CARD_W = getCardWidth(PAD, GAP, COL);
const BW = getBannerWidth(PAD);
const TAB_H = wp(60) + BOTTOM_SAFE_H;

const BG_L = ['#fef2f2','#fef9ee','#eef6ff','#f0fdf4','#fdf2f8','#fffbeb','#eef2ff','#fff7ed'];
const BG_D = ['#352020','#352a18','#1a2535','#1a2a1c','#351a30','#35300a','#1a1a35','#352518'];

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
      setBannerIdx((p) => { const n=(p+1)%BANNERS.length; bannerRef.current?.scrollTo({ x:n*(BW+GAP), animated:true }); return n; });
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
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[$.navTitle, { color: colors.text }]}>BeadForge</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={toggle} {...{ dataSet: { class: 'nav-btn' } }} style={[$.navBtn, { backgroundColor: colors.inputBg }]} activeOpacity={0.6}>
          <Feather name={dark ? 'sun' : 'moon'} size={fp(16)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textHint} />}>

        {/* 搜索栏 */}
        <View style={{ paddingHorizontal: PAD, paddingTop: wp(15), paddingBottom: wp(5) }}>
          <View {...{ dataSet: { class: 'search' } } as any} style={[$.search, { backgroundColor: colors.surface, borderColor: searchFocused ? colors.accent : colors.border }]}>
            <Feather name="search" size={fp(15)} color={colors.textHint} style={{ marginRight: wp(8) }} />
            <TextInput style={[$.searchInput, { color: colors.text }]} placeholder="搜索拼豆图案..."
              placeholderTextColor={colors.textHint} value={searchKeyword} onChangeText={handleSearch}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}><Feather name="x-circle" size={fp(15)} color={colors.textHint} /></TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banner */}
        <ScrollView ref={bannerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          snapToInterval={BW+GAP} decelerationRate="fast"
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x/(BW+GAP)))}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: wp(10) }}>
          {BANNERS.map((b) => (
            <TouchableOpacity key={b.id} activeOpacity={0.85} {...{ dataSet: { class: 'banner' } }} style={[$.banner, { width: BW, backgroundColor: b.bg, marginRight: GAP }]}>
              <View style={$.bannerInner}>
                <Text style={$.bannerT}>{b.title}</Text>
                <Text style={$.bannerS}>{b.sub}</Text>
              </View>
              <View style={$.bannerArt}>
                <BeadGrid pixels={ALL_PATTERNS[b.pi]} beadSize={isSmall?7:wp(8)} gap={wp(1)} round glossy={false} />
              </View>
            </TouchableOpacity>
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
              <TouchableOpacity key={name} onPress={() => setFilter(undefined, CAT_KEYS[idx] || null)} activeOpacity={0.6}
                {...{ dataSet: { class: 'cat' } }}
                style={[$.cat, { backgroundColor: on ? colors.text : colors.surface, borderColor: on ? colors.text : colors.border }]}>
                <Text style={[$.catT, { color: on ? '#fff' : colors.textSecondary }]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
          {CATS.length > CAT_FOLD_LIMIT && (
            <TouchableOpacity onPress={() => setCatExpanded(!catExpanded)} activeOpacity={0.6}
              style={[$.cat, $.catToggle, { borderColor: colors.border }]}>
              <Text style={[$.catT, { color: colors.textHint }]}>{catExpanded ? '收起' : `展开 +${CATS.length - CAT_FOLD_LIMIT}`}</Text>
              <Feather name={catExpanded ? 'chevron-up' : 'chevron-down'} size={fp(12)} color={colors.textHint} style={{ marginLeft: wp(3) }} />
            </TouchableOpacity>
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
        <TouchableOpacity style={[$.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => scrollRef.current?.scrollTo({ y:0, animated:true })} activeOpacity={0.7}
          {...{ dataSet: { class: 'fab' } } as any}>
          <Feather name="chevron-up" size={fp(18)} color={colors.textSecondary} />
        </TouchableOpacity>
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
    <PressableScale style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]} scale={0.98} dataClass="card">
      <View style={[$.cardCover, { height: h, backgroundColor: bg }]}>
        <BeadGrid pixels={pat} beadSize={bs} gap={1} round />
      </View>
      <View style={$.cardBody}>
        <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={$.cardMeta}>
          <Text style={[$.cardAuthor, { color: colors.textHint }]}>{item.authorName || '创作者'}</Text>
          <View style={$.likeRow}>
            <Feather name="heart" size={fp(11)} color={colors.textHint} />
            <Text style={[$.likeN, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },

  // 导航栏 - 60px高，底部1px边框
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  navTitle: { fontSize: fp(18), fontWeight: '700', letterSpacing: -0.3 },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },

  // 搜索 - 1px边框，小圆角
  search: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(40), borderRadius: BorderRadius.md, paddingHorizontal: wp(12),
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, padding: 0 },

  // Banner - 小圆角10px
  banner: {
    height: wp(120), borderRadius: BorderRadius.lg, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(20),
  },
  bannerInner: { flex: 1, zIndex: 1 },
  bannerT: { fontSize: fp(20), fontWeight: '700', color: '#fff' },
  bannerS: { fontSize: fp(12), color: 'rgba(255,255,255,0.8)', marginTop: wp(5) },
  bannerArt: {
    backgroundColor: 'rgba(255,255,255,0.15)', padding: wp(10), borderRadius: BorderRadius.md,
  },

  // 指示器
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(10), gap: wp(5) },
  dot: { width: wp(5), height: wp(5), borderRadius: wp(3), transition: 'all 0.3s' } as any,
  dotOn: { width: wp(15) },

  // 分类 - 1px 边框圆角药丸
  catWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: PAD, paddingTop: wp(15), paddingBottom: wp(10), gap: wp(8),
  },
  cat: { paddingHorizontal: wp(15), paddingVertical: wp(6), borderRadius: BorderRadius.full, borderWidth: 1 },
  catToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderStyle: 'dashed' as any },
  catT: { fontSize: FontSize.sm, fontWeight: '500' },

  // 标题
  secRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: PAD, marginBottom: wp(10),
  },
  secT: { fontSize: FontSize.xl, fontWeight: '700' },
  secN: { fontSize: FontSize.xs },

  // 网格
  grid: { flexDirection: 'row', paddingHorizontal: PAD, gap: GAP },
  col: { flex: 1, gap: GAP },

  // 卡片 - 1px边框 + 微阴影，小圆角10px
  card: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: wp(10) },
  cardTitle: { fontSize: FontSize.md, fontWeight: '500', marginBottom: wp(5) },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthor: { fontSize: FontSize.xs },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  likeN: { fontSize: FontSize.xs },

  endT: { textAlign: 'center', fontSize: FontSize.xs, paddingVertical: wp(20), letterSpacing: wp(1) },

  // FAB - 圆形 + 边框
  fab: { position: 'absolute', right: wp(15) },
  fabBtn: {
    width: wp(40), height: wp(40), borderRadius: wp(20),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
});
