import React, { useEffect, useCallback, useRef, useState, memo, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput, Animated,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView, PressableScale, CardSkeleton, HoverView } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';
import { wp, fp, screenW, getColumnCount, getCardWidth, getBannerWidth, isSmall, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { hapticLight } from '../../hooks/useFeedback';

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
  { id: 1, title: '热门精选', sub: '本周最受欢迎的拼豆图案', pi: 0, bg: '#4b78ff', sort: 'hot', cat: '' },
  { id: 2, title: '可爱萌宠', sub: '人气动物系列合集', pi: 1, bg: '#d6b161', sort: 'popular', cat: 'animal' },
  { id: 3, title: '像素经典', sub: '游戏角色完美还原', pi: 2, bg: '#549da5', sort: 'popular', cat: 'pixel' },
  { id: 4, title: '花之物语', sub: '春日花卉图案', pi: 3, bg: '#bf60fe', sort: 'latest', cat: 'flower' },
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

  const { filtered, cols } = useMemo(() => {
    const f = searchKeyword.trim()
      ? designs.filter((d) => d.title.includes(searchKeyword.trim()))
      : designs;
    const c: DesignItem[][] = Array.from({ length: COL }, () => []);
    f.forEach((item, i) => c[i % COL].push(item));
    return { filtered: f, cols: c };
  }, [designs, searchKeyword]);
  const isFirstLoad = loading && designs.length === 0;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 导航栏 */}
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={$.brandRow}>
          <View style={[$.brandDot, { backgroundColor: colors.accent }]}>
            <Text style={$.brandEmoji}>🧩</Text>
          </View>
          <View>
            <Text style={[$.brandName, { color: colors.text }]}>
              B<Text style={{ color: colors.accent }}>ead</Text>Forge
            </Text>
            <Text style={[$.brandSub, { color: colors.textHint }]}>拼出你的创意世界</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <HoverView onPress={toggle} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name={dark ? 'sun' : 'moon'} size={fp(16)} color={colors.textSecondary} />
        </HoverView>
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
              <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ padding: wp(6) }}><Feather name="x-circle" size={fp(16)} color={colors.textHint} /></TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banner */}
        <ScrollView ref={bannerRef} horizontal showsHorizontalScrollIndicator={false}
          snapToInterval={BW + wp(10)} decelerationRate="fast"
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (BW + wp(10))))}
          contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: wp(12), gap: wp(10) }}>
          {BANNERS.map((b) => (
            <HoverView key={b.id} hoverScale={1.015} hoverLift={4} onPress={() => { setFilter(b.sort, b.cat || null); }} style={[$.banner, { width: BW, backgroundColor: b.bg }]}>
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
                hoverScale={1.05} hoverLift={1}
                style={[$.cat, { backgroundColor: on ? colors.text : colors.surface, borderColor: on ? colors.text : colors.border }]}>
                <Text style={[$.catT, { color: on ? '#fff' : colors.textSecondary }]}>{name}</Text>
              </HoverView>
            );
          })}
          {CATS.length > CAT_FOLD_LIMIT && (
            <HoverView onPress={() => setCatExpanded(!catExpanded)} hoverScale={1.05} hoverLift={1}
              style={[$.cat, $.catToggle, { borderColor: colors.border }]}>
              <Text style={[$.catT, { color: colors.textHint }]}>{catExpanded ? '收起' : `展开 +${CATS.length - CAT_FOLD_LIMIT}`}</Text>
              <Feather name={catExpanded ? 'chevron-up' : 'chevron-down'} size={fp(12)} color={colors.textHint} style={{ marginLeft: wp(3) }} />
            </HoverView>
          )}
        </View>

        {/* 排序 + 标题 */}
        <View style={$.secRow}>
          <Text style={[$.secT, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && <Text style={[$.secN, { color: colors.textHint }]}>{filtered.length} 个作品</Text>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: wp(8) }}>
          {[
            { key: 'latest', label: '最新' },
            { key: 'hot', label: '热度' },
            { key: 'popular', label: '点赞' },
            { key: 'views', label: '浏览' },
          ].map((s) => {
            const on = useDesignStore.getState().sortBy === s.key;
            return (
              <TouchableOpacity key={s.key} activeOpacity={0.7} onPress={() => setFilter(s.key)} style={{ marginRight: wp(12) }}>
                <Text style={{ fontSize: fp(12), fontWeight: on ? '700' : '400', color: on ? colors.accent : colors.textHint }}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
          onPress={() => scrollRef.current?.scrollTo({ y:0, animated:true })} hoverScale={1.12} hoverLift={2}>
          <Feather name="chevron-up" size={fp(18)} color={colors.textSecondary} />
        </HoverView>
      </Animated.View>
    </SafeAreaView>
  );
};

/** 画廊卡片 - moely 风格：小圆角+细边框+淡阴影 */
const Card = memo(({ item }: { item: DesignItem }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<any>();
  const pat = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const h = wp(100) + (item.id * 31) % wp(60);
  const bg = (dark ? BG_D : BG_L)[item.id % BG_L.length];
  const bs = Math.min(Math.max(Math.floor(CARD_W / (pat[0]?.length||9)) - 2, wp(3)), wp(8));

  return (
    <PressableScale
      style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      scale={0.98} dataClass="card"
      onPress={() => navigation.navigate('DesignDetail', { item })}
    >
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
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: wp(30), height: wp(30), borderRadius: wp(9),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
  },
  brandEmoji: { fontSize: fp(15) },
  brandName: { fontSize: fp(17), fontWeight: '900', letterSpacing: 0.5 },
  brandSub: { fontSize: fp(9), marginTop: wp(1), letterSpacing: 0.3 },
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
  catToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
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

  // 卡片
  card: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
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
    ...shadow(2, 6, 0.1, '#000', 3),
  },
});
