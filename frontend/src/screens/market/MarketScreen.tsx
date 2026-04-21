import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Dimensions,
  TextInput, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePatternStore, MarketPattern } from '../../store/usePatternStore';
import { hapticLight, hapticSuccess } from '../../hooks/useFeedback';
import type { RootStackParamList } from '../../navigation/types';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';

const PAD = wp(15);
const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;
const CARD_W = Math.floor((W - PAD * 2 - wp(10)) / 2);

/* ═══════════════════ 材料数据 ═══════════════════ */

interface Product {
  id: number; name: string; desc: string; price: number;
  originalPrice?: number; sales: number; rating: number;
  tag?: string; color: string; icon: string; cat: string; specs: string[];
}
interface CartItem { product: Product; qty: number }

const MAT_CATS = ['全部', '珠子', '拼豆板', '工具', '套装', '配件'];
const MAT_SORTS = ['综合', '销量', '价格↑', '价格↓'];

const PRODUCTS: Product[] = [
  { id: 1, name: '5mm标准珠·48色', desc: '约24000颗入门必备', price: 29.9, originalPrice: 49.9, sales: 8234, rating: 4.8, tag: '爆款', color: '#EF4444', icon: 'box', cat: '珠子', specs: ['5mm', '48色', '约24000颗'] },
  { id: 2, name: '迷你珠2.6mm·72色', desc: '精细图案专用', price: 45.0, sales: 3421, rating: 4.9, color: '#8B5CF6', icon: 'box', cat: '珠子', specs: ['2.6mm', '72色', '约36000颗'] },
  { id: 3, name: '大号拼豆板29×29', desc: '透明白可拼接', price: 8.9, originalPrice: 12.0, sales: 12500, rating: 4.7, tag: '热销', color: '#3B82F6', icon: 'layout', cat: '拼豆板', specs: ['29×29格', '透明白'] },
  { id: 4, name: '六角拼豆板', desc: '六边形创意造型', price: 6.5, sales: 5600, rating: 4.6, color: '#22C55E', icon: 'hexagon', cat: '拼豆板', specs: ['六角形', '透明'] },
  { id: 5, name: '尖头镊子', desc: '不锈钢精准夹取', price: 5.9, sales: 9870, rating: 4.8, color: '#F97316', icon: 'tool', cat: '工具', specs: ['不锈钢', '尖头'] },
  { id: 6, name: '熨烫专用烫纸50张', desc: '耐高温不粘珠', price: 3.5, originalPrice: 5.0, sales: 15600, rating: 4.5, tag: '必买', color: '#EC4899', icon: 'file', cat: '配件', specs: ['50张', '15×15cm'] },
  { id: 7, name: '新手入门套装', desc: '珠子+板+镊子+烫纸', price: 39.9, originalPrice: 68.0, sales: 6700, rating: 4.9, tag: '推荐', color: '#0EA5E9', icon: 'package', cat: '套装', specs: ['24色', '全套'] },
  { id: 8, name: '夜光珠12色', desc: '暗处持续发光', price: 19.9, sales: 2100, rating: 4.4, color: '#FBBF24', icon: 'sun', cat: '珠子', specs: ['12色', '夜光'] },
  { id: 9, name: '收纳盒36格', desc: '透明盖分色收纳', price: 15.9, originalPrice: 22.0, sales: 5100, rating: 4.7, color: '#F87171', icon: 'archive', cat: '工具', specs: ['36格', '27×17cm'] },
  { id: 10, name: '磁铁贴片100片', desc: '做冰箱贴神器', price: 7.5, sales: 4300, rating: 4.5, color: '#16A34A', icon: 'disc', cat: '配件', specs: ['100片', '自粘'] },
];

/* ═══════════════════ 图纸数据 ═══════════════════ */

const PAT_CATS = ['全部', '动物', '卡通', '花卉', '美食', '抽象', '像素'];
const PAT_SORTS = ['最新', '最热', '价格↑', '免费'];

/* ═══════════════════ 主屏幕 ═══════════════════ */

const TABS_DEF = [
  { key: 'material' as const, icon: 'shopping-bag' as const, label: '材料商城', sub: '珠子·工具·配件' },
  { key: 'pattern' as const, icon: 'file-text' as const, label: '图纸市场', sub: '设计·模板·创意' },
];

export const MarketScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [tab, setTab] = useState<'material' | 'pattern'>('material');

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 顶部 — 和发现页统一风格 */}
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={$.brandRow}>
          <View style={[$.brandDot, { backgroundColor: '#F97316' }]}>
            <Feather name="shopping-bag" size={fp(13)} color="#fff" />
          </View>
          <View>
            <Text style={[$.brandName, { color: colors.text }]}>
              拼豆<Text style={{ color: '#F97316' }}>市场</Text>
            </Text>
            <Text style={[$.brandSub, { color: colors.textHint }]}>材料·图纸·一站购齐</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        {/* 频道切换 */}
        <View style={[$.segmentWrap, { backgroundColor: colors.inputBg }]}>
          {TABS_DEF.map((t) => {
            const on = tab === t.key;
            return (
              <TouchableOpacity key={t.key} activeOpacity={0.85} onPress={() => setTab(t.key)}
                style={[$.segmentItem, on && { backgroundColor: colors.accent }]}>
                <Text style={[$.segmentText, { color: on ? '#fff' : colors.textSecondary }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {tab === 'material' ? <MaterialTab colors={colors} dark={dark} /> : <PatternTab colors={colors} dark={dark} />}
    </SafeAreaView>
  );
};

/* ═══════════════════ 材料 Tab ═══════════════════ */

const MaterialTab: React.FC<{ colors: ThemeColors; dark: boolean }> = ({ colors, dark }) => {
  const matNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [catIdx, setCatIdx] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (catIdx > 0) list = list.filter((p) => p.cat === MAT_CATS[catIdx]);
    if (search.trim()) { const kw = search.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(kw)); }
    if (sortIdx === 1) list.sort((a, b) => b.sales - a.sales);
    else if (sortIdx === 2) list.sort((a, b) => a.price - b.price);
    else if (sortIdx === 3) list.sort((a, b) => b.price - a.price);
    return list;
  }, [catIdx, sortIdx, search]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 1200); }, []);
  const addToCart = useCallback((p: Product) => {
    hapticLight();
    setCart((prev) => { const e = prev.find((c) => c.product.id === p.id); return e ? prev.map((c) => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { product: p, qty: 1 }]; });
    showToast(`已加入：${p.name}`);
  }, [showToast]);
  const changeQty = useCallback((id: number, d: number) => { setCart((prev) => prev.map((c) => c.product.id === id ? { ...c, qty: Math.max(1, c.qty + d) } : c)); }, []);
  const removeFromCart = useCallback((id: number) => { setCart((prev) => prev.filter((c) => c.product.id !== id)); }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* 搜索 + 购物车 */}
      <View style={[$.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[$.searchBox, { backgroundColor: colors.inputBg }]}>
          <Feather name="search" size={fp(14)} color={colors.textHint} />
          <TextInput style={[$.searchInput, { color: colors.text }]} placeholder="搜索材料..." placeholderTextColor={colors.textHint} value={search} onChangeText={setSearch} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={fp(14)} color={colors.textHint} /></TouchableOpacity>}
        </View>
        <TouchableOpacity onPress={() => setShowCart(true)} activeOpacity={0.7} style={[$.cartIcon, { backgroundColor: colors.inputBg }]}>
          <Feather name="shopping-cart" size={fp(16)} color={colors.text} />
          {cartCount > 0 && <View style={$.badge}><Text style={$.badgeT}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <FlatList data={filtered} numColumns={2} keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingBottom: wp(60) + BOTTOM_SAFE_H }}
        columnWrapperStyle={{ paddingHorizontal: PAD, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        ListHeaderComponent={
          <View>
            <View style={$.catWrap}>
              {MAT_CATS.map((c, i) => <CatChip key={c} label={c} on={i === catIdx} onPress={() => setCatIdx(i)} colors={colors} />)}
            </View>
            <View style={[$.sortBar, { borderBottomColor: colors.border }]}>
              {MAT_SORTS.map((s, i) => <SortBtn key={s} label={s} on={i === sortIdx} onPress={() => setSortIdx(i)} colors={colors} />)}
              <View style={{ flex: 1 }} />
              <Text style={[$.countT, { color: colors.textHint }]}>{filtered.length} 件</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="inbox" text="没有找到商品" colors={colors} />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(10) }}>
            <MatCard p={item} colors={colors} dark={dark} onPress={() => matNav.navigate('ProductDetail', { product: { ...item, description: item.desc, category: item.cat, specs: JSON.stringify(item.specs) } as any })} onAdd={() => addToCart(item)} />
          </View>
        )}
      />

      {toast.length > 0 && <Toast text={toast} colors={colors} />}

      {/* 购物车 */}
      <Modal visible={showCart} animationType="fade" transparent onRequestClose={() => setShowCart(false)}>
        <TouchableOpacity style={$.overlay} activeOpacity={1} onPress={() => setShowCart(false)}>
          <View style={[$.sheet, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <CartSheet cart={cart} colors={colors} cartTotal={cartTotal} cartCount={cartCount}
              onClose={() => setShowCart(false)} onRemove={removeFromCart} onChangeQty={changeQty}
              onClear={() => { setCart([]); showToast('已清空'); }}
              onCheckout={() => { setShowCart(false); Alert.alert('下单成功', `共 ${cartCount} 件，¥${cartTotal.toFixed(1)}`); setCart([]); }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

/* ═══════════════════ 图纸 Tab ═══════════════════ */

const PatternTab: React.FC<{ colors: ThemeColors; dark: boolean }> = ({ colors, dark }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const listings = usePatternStore((s) => s.listings);
  const buy = usePatternStore((s) => s.buy);
  const hasBought = usePatternStore((s) => s.hasBought);
  const [catIdx, setCatIdx] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<MarketPattern | null>(null);

  const filtered = useMemo(() => {
    let list = [...listings];
    if (catIdx > 0) list = list.filter((p) => p.cat === PAT_CATS[catIdx]);
    if (search.trim()) { const kw = search.toLowerCase(); list = list.filter((p) => p.title.toLowerCase().includes(kw) || p.author.toLowerCase().includes(kw)); }
    if (sortIdx === 1) list.sort((a, b) => b.downloads - a.downloads);
    else if (sortIdx === 2) list.sort((a, b) => a.price - b.price);
    else if (sortIdx === 3) list = list.filter((p) => p.free);
    return list;
  }, [listings, catIdx, sortIdx, search]);

  const handleBuy = useCallback((p: MarketPattern) => {
    if (hasBought(p.id)) {
      // 已拥有 → 直接用
      navigation.navigate('Editor', { mode: 'manual', cols: p.cols, rows: p.rows });
      setDetail(null);
      return;
    }
    if (p.free) {
      buy(p.id);
      Alert.alert('下载成功', `「${p.title}」已保存`, [
        { text: '去制作', onPress: () => { setDetail(null); navigation.navigate('Editor', { mode: 'manual', cols: p.cols, rows: p.rows }); } },
        { text: '继续逛' },
      ]);
    } else {
      Alert.alert('确认购买', `「${p.title}」 ¥${p.price}`, [
        { text: '取消', style: 'cancel' },
        { text: '购买', onPress: () => {
          buy(p.id);
          Alert.alert('购买成功', `「${p.title}」已保存到已购图纸`, [
            { text: '去制作', onPress: () => { setDetail(null); navigation.navigate('Editor', { mode: 'manual', cols: p.cols, rows: p.rows }); } },
            { text: '好的' },
          ]);
        }},
      ]);
    }
  }, [buy, hasBought, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[$.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[$.searchBox, { backgroundColor: colors.inputBg, flex: 1 }]}>
          <Feather name="search" size={fp(14)} color={colors.textHint} />
          <TextInput style={[$.searchInput, { color: colors.text }]} placeholder="搜索图纸或作者..." placeholderTextColor={colors.textHint} value={search} onChangeText={setSearch} />
        </View>
      </View>

      <FlatList data={filtered} numColumns={2} keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingBottom: wp(60) + BOTTOM_SAFE_H }}
        columnWrapperStyle={{ paddingHorizontal: PAD, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        ListHeaderComponent={
          <View>
            <View style={$.catWrap}>
              {PAT_CATS.map((c, i) => <CatChip key={c} label={c} on={i === catIdx} onPress={() => setCatIdx(i)} colors={colors} />)}
            </View>
            <View style={[$.sortBar, { borderBottomColor: colors.border }]}>
              {PAT_SORTS.map((s, i) => <SortBtn key={s} label={s} on={i === sortIdx} onPress={() => setSortIdx(i)} colors={colors} />)}
              <View style={{ flex: 1 }} />
              <Text style={[$.countT, { color: colors.textHint }]}>{filtered.length} 张</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="file" text="没有找到图纸" colors={colors} />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(10) }}>
            <PatCard p={item} colors={colors} dark={dark} owned={hasBought(item.id)} onPress={() => setDetail(item)} />
          </View>
        )}
      />

      {/* 图纸详情 */}
      <Modal visible={!!detail} animationType="fade" transparent onRequestClose={() => setDetail(null)}>
        <TouchableOpacity style={$.overlay} activeOpacity={1} onPress={() => setDetail(null)}>
          <View style={[$.sheet, { backgroundColor: colors.surface, maxHeight: H * 0.78 }]} onStartShouldSetResponder={() => true}>
            {detail && <PatDetail p={detail} colors={colors} dark={dark} owned={hasBought(detail.id)}
              onClose={() => setDetail(null)} onBuy={() => handleBuy(detail)}
              onMake={() => { setDetail(null); navigation.navigate('Editor', { mode: 'manual', cols: detail.cols, rows: detail.rows }); }} />}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

/* ═══════════════════ 通用组件 ═══════════════════ */

const CatChip: React.FC<{ label: string; on: boolean; onPress: () => void; colors: ThemeColors }> = memo(({ label, on, onPress, colors }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress}
    style={[$.catChip, { backgroundColor: on ? colors.accent : colors.surface, borderColor: on ? colors.accent : colors.border }]}>
    <Text style={[$.catText, { color: on ? '#fff' : colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
));

const SortBtn: React.FC<{ label: string; on: boolean; onPress: () => void; colors: ThemeColors }> = memo(({ label, on, onPress, colors }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={$.sortItem}>
    <Text style={[$.sortText, { color: on ? colors.accent : colors.textHint, fontWeight: on ? '700' : '400' }]}>{label}</Text>
  </TouchableOpacity>
));

const EmptyState: React.FC<{ icon: string; text: string; colors: ThemeColors }> = ({ icon, text, colors }) => (
  <View style={$.empty}><Feather name={icon as any} size={fp(32)} color={colors.textHint} /><Text style={[$.emptyT, { color: colors.textHint }]}>{text}</Text></View>
);

const Toast: React.FC<{ text: string; colors: ThemeColors }> = ({ text, colors }) => (
  <View style={$.toast} pointerEvents="none">
    <View style={[$.toastBox, { backgroundColor: colors.text }]}>
      <Feather name="check-circle" size={fp(13)} color={colors.bg} />
      <Text style={[$.toastT, { color: colors.bg }]}>{text}</Text>
    </View>
  </View>
);

/* ═══════════════════ 材料卡片 ═══════════════════ */

const MatCard: React.FC<{ p: Product; colors: ThemeColors; dark: boolean; onPress: () => void; onAdd: () => void }> = memo(({ p, colors, dark, onPress, onAdd }) => (
  <View style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={[$.cardCover, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : p.color + '10' }]}>
        <View style={[$.cardIconC, { backgroundColor: p.color + '18' }]}><Feather name={p.icon as any} size={fp(18)} color={p.color} /></View>
        {p.tag ? <View style={[$.cardTag, { backgroundColor: p.color }]}><Text style={$.cardTagT}>{p.tag}</Text></View> : null}
      </View>
      <View style={{ paddingHorizontal: wp(8), paddingTop: wp(6) }}>
        <Text style={[$.cardName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
        <Text style={[$.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{p.desc}</Text>
      </View>
    </TouchableOpacity>
    <View style={$.cardFoot}>
      <Text style={$.priceT}>¥{p.price}</Text>
      <TouchableOpacity activeOpacity={0.7} onPress={onAdd} style={[$.addBtnS, { backgroundColor: colors.accent }]}>
        <Feather name="plus" size={fp(13)} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
));

/* ═══════════════════ 图纸卡片 ═══════════════════ */

const PatCard: React.FC<{ p: MarketPattern; colors: ThemeColors; dark: boolean; owned: boolean; onPress: () => void }> = memo(({ p, colors, dark, owned, onPress }) => {
  const pat = ALL_PATTERNS[p.patIdx % ALL_PATTERNS.length];
  const bs = Math.floor((CARD_W - wp(20)) / (pat[0]?.length || 9));
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[$.patPreview, { backgroundColor: dark ? '#222' : '#f8f8f8' }]}>
        <BeadGrid pixels={pat} beadSize={Math.min(bs, wp(7))} gap={1} round />
        {owned && (
          <View style={$.ownedBadge}>
            <Feather name="check" size={fp(9)} color="#fff" />
            <Text style={$.ownedBadgeT}>已拥有</Text>
          </View>
        )}
      </View>
      <View style={{ padding: wp(8) }}>
        <Text style={[$.cardName, { color: colors.text }]} numberOfLines={1}>{p.title}</Text>
        <View style={$.patMeta}>
          <Text style={[$.patAuthor, { color: colors.textHint }]}>{p.author}</Text>
          <Text style={[$.patDl, { color: colors.textHint }]}>{p.downloads > 1000 ? (p.downloads / 1000).toFixed(1) + 'k' : p.downloads} 下载</Text>
        </View>
        <View style={$.patPriceRow}>
          {owned
            ? <View style={[$.freeTag, { backgroundColor: '#EEF2FF' }]}><Text style={[$.freeTagT, { color: '#4b78ff' }]}>去制作</Text></View>
            : p.free
              ? <View style={$.freeTag}><Text style={$.freeTagT}>免费</Text></View>
              : <Text style={$.priceT}>¥{p.price}</Text>
          }
          <View style={$.ratingSmall}>
            <Feather name="star" size={fp(10)} color="#FBBF24" />
            <Text style={[$.ratingSmallT, { color: colors.textHint }]}>{p.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ═══════════════════ 材料详情 ═══════════════════ */

const MatDetail: React.FC<{ p: Product; colors: ThemeColors; onAdd: () => void; onClose: () => void }> = ({ p, colors, onAdd, onClose }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <View style={$.dtHeader}>
      <View style={[$.dtIcon, { backgroundColor: p.color + '15' }]}><Feather name={p.icon as any} size={fp(26)} color={p.color} /></View>
      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={[$.closeBtn, { backgroundColor: colors.inputBg }]}><Feather name="x" size={fp(16)} color={colors.text} /></TouchableOpacity>
    </View>
    <Text style={[$.dtName, { color: colors.text }]}>{p.name}</Text>
    <Text style={[$.dtDesc, { color: colors.textSecondary }]}>{p.desc}</Text>
    <View style={$.dtRow}><Feather name="star" size={fp(12)} color="#FBBF24" /><Text style={[$.dtRating, { color: colors.text }]}>{p.rating}</Text><Text style={[$.dtSales, { color: colors.textHint }]}>{p.sales} 人已购</Text></View>
    <View style={$.specWrap}>{p.specs.map((s) => <View key={s} style={[$.specC, { backgroundColor: colors.inputBg }]}><Text style={[$.specCT, { color: colors.textSecondary }]}>{s}</Text></View>)}</View>
    {p.originalPrice ? <View style={$.discBanner}><Feather name="tag" size={fp(11)} color="#EF4444" /><Text style={$.discT}>省 ¥{(p.originalPrice - p.price).toFixed(1)}</Text></View> : null}
    <View style={[$.dtFoot, { borderTopColor: colors.divider }]}>
      <Text style={$.dtPrice}>¥{p.price}</Text>
      {p.originalPrice ? <Text style={[$.dtPriceOld, { color: colors.textHint }]}>¥{p.originalPrice}</Text> : null}
      <View style={{ flex: 1 }} />
      <TouchableOpacity activeOpacity={0.8} onPress={onAdd} style={[$.dtAddBtn, { backgroundColor: colors.accent }]}>
        <Feather name="shopping-cart" size={fp(13)} color="#fff" />
        <Text style={$.dtAddBtnT}>加入购物车</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

/* ═══════════════════ 图纸详情 ═══════════════════ */

const PatDetail: React.FC<{ p: MarketPattern; colors: ThemeColors; dark: boolean; owned: boolean; onClose: () => void; onBuy: () => void; onMake: () => void }> = ({ p, colors, dark, owned, onClose, onBuy, onMake }) => {
  const pat = ALL_PATTERNS[p.patIdx % ALL_PATTERNS.length];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={$.dtHeader}>
        <Text style={[$.dtName, { color: colors.text, flex: 1 }]}>{p.title}</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={[$.closeBtn, { backgroundColor: colors.inputBg }]}><Feather name="x" size={fp(16)} color={colors.text} /></TouchableOpacity>
      </View>
      <View style={[$.patBigPreview, { backgroundColor: dark ? '#222' : '#f8f8f8' }]}>
        <BeadGrid pixels={pat} beadSize={wp(16)} gap={wp(1.5)} round glossy />
      </View>
      <View style={$.patInfoRow}>
        <Avatar name={p.author} size={wp(28)} />
        <Text style={[$.patInfoAuthor, { color: colors.text }]}>{p.author}</Text>
        <View style={{ flex: 1 }} />
        <Feather name="star" size={fp(12)} color="#FBBF24" />
        <Text style={[$.patInfoRating, { color: colors.text }]}>{p.rating}</Text>
      </View>
      <Text style={[$.dtDesc, { color: colors.textSecondary }]}>{p.desc}</Text>
      <View style={$.specWrap}>
        <View style={[$.specC, { backgroundColor: colors.inputBg }]}><Text style={[$.specCT, { color: colors.textSecondary }]}>{p.cols}×{p.rows} 格</Text></View>
        <View style={[$.specC, { backgroundColor: colors.inputBg }]}><Text style={[$.specCT, { color: colors.textSecondary }]}>{p.cat}</Text></View>
        <View style={[$.specC, { backgroundColor: colors.inputBg }]}><Text style={[$.specCT, { color: colors.textSecondary }]}>{p.downloads} 次下载</Text></View>
      </View>
      <View style={[$.dtFoot, { borderTopColor: colors.divider }]}>
        {owned ? (
          <>
            <View style={[$.freeTag, { backgroundColor: '#EEF2FF', paddingHorizontal: wp(10), paddingVertical: wp(4) }]}>
              <Text style={[$.freeTagT, { color: '#4b78ff', fontSize: fp(12) }]}>已拥有</Text>
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity activeOpacity={0.8} onPress={onMake} style={[$.dtAddBtn, { backgroundColor: colors.accent }]}>
              <Feather name="play" size={fp(13)} color="#fff" />
              <Text style={$.dtAddBtnT}>开始制作</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {p.free ? <View style={[$.freeTag, { paddingHorizontal: wp(12), paddingVertical: wp(4) }]}><Text style={[$.freeTagT, { fontSize: fp(14) }]}>免费</Text></View> : <Text style={$.dtPrice}>¥{p.price}</Text>}
            <View style={{ flex: 1 }} />
            <TouchableOpacity activeOpacity={0.8} onPress={onBuy} style={[$.dtAddBtn, { backgroundColor: colors.accent }]}>
              <Feather name={p.free ? 'download' : 'shopping-cart'} size={fp(13)} color="#fff" />
              <Text style={$.dtAddBtnT}>{p.free ? '免费下载' : '购买图纸'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

/* ═══════════════════ 购物车 ═══════════════════ */

const CartSheet: React.FC<{
  cart: CartItem[]; colors: ThemeColors; cartTotal: number; cartCount: number;
  onClose: () => void; onRemove: (id: number) => void; onChangeQty: (id: number, d: number) => void;
  onClear: () => void; onCheckout: () => void;
}> = ({ cart, colors, cartTotal, cartCount, onClose, onRemove, onChangeQty, onClear, onCheckout }) => (
  <View>
    {/* 头部 */}
    <View style={$.cartHead}>
      <Text style={[$.cartHeadT, { color: colors.text }]}>购物车</Text>
      {cart.length > 0 && <TouchableOpacity onPress={onClear} activeOpacity={0.6}><Text style={[$.clearT, { color: colors.textHint }]}>清空</Text></TouchableOpacity>}
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={onClose} activeOpacity={0.7}><Feather name="x" size={fp(18)} color={colors.text} /></TouchableOpacity>
    </View>

    {cart.length === 0 ? (
      <View style={$.cartEmpty}>
        <Feather name="shopping-bag" size={fp(32)} color={colors.textHint} />
        <Text style={[$.emptyT, { color: colors.textHint }]}>购物车是空的</Text>
      </View>
    ) : (
      <View>
        {/* 商品列表 — 固定最大高度，超出可滚动 */}
        <ScrollView style={{ maxHeight: H * 0.35 }} showsVerticalScrollIndicator={false}>
          {cart.map((c) => (
            <View key={c.product.id} style={[$.cartRow, { borderBottomColor: colors.divider }]}>
              <View style={[$.cartRowIcon, { backgroundColor: c.product.color + '12' }]}>
                <Feather name={c.product.icon as any} size={fp(14)} color={c.product.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[$.cartRowName, { color: colors.text }]} numberOfLines={1}>{c.product.name}</Text>
                <Text style={$.cartRowPrice}>¥{(c.product.price * c.qty).toFixed(1)}</Text>
              </View>
              <View style={$.qtyRow}>
                <TouchableOpacity onPress={() => c.qty <= 1 ? onRemove(c.product.id) : onChangeQty(c.product.id, -1)} activeOpacity={0.6} style={[$.qtyBtn, { borderColor: colors.border }]}>
                  <Feather name={c.qty <= 1 ? 'trash-2' : 'minus'} size={fp(11)} color={c.qty <= 1 ? '#EF4444' : colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[$.qtyN, { color: colors.text }]}>{c.qty}</Text>
                <TouchableOpacity onPress={() => onChangeQty(c.product.id, 1)} activeOpacity={0.6} style={[$.qtyBtn, { borderColor: colors.border }]}>
                  <Feather name="plus" size={fp(11)} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 结算栏 — 始终在底部 */}
        <View style={[$.cartFoot, { borderTopColor: colors.divider }]}>
          <View>
            <Text style={[$.cartFootL, { color: colors.textHint }]}>合计</Text>
            <Text style={$.cartFootP}>¥{cartTotal.toFixed(1)}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity activeOpacity={0.8} onPress={onCheckout} style={[$.checkBtn, { backgroundColor: colors.accent }]}>
            <Text style={$.checkBtnT}>结算 ({cartCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
);

/* ═══════════════════ 样式 ═══════════════════ */

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(54), paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: wp(30), height: wp(30), borderRadius: wp(9),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
  },
  brandName: { fontSize: fp(17), fontWeight: '900', letterSpacing: 0.5 },
  brandSub: { fontSize: fp(9), marginTop: wp(1) },
  segmentWrap: {
    flexDirection: 'row', borderRadius: wp(8), padding: wp(2),
  },
  segmentItem: {
    paddingHorizontal: wp(10), paddingVertical: wp(5), borderRadius: wp(6),
  },
  segmentText: { fontSize: fp(12), fontWeight: '600' },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingVertical: wp(8), borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', height: wp(34), borderRadius: wp(17), paddingHorizontal: wp(10) },
  searchInput: { flex: 1, fontSize: fp(13), marginLeft: wp(6), padding: 0 },
  cartIcon: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center', marginLeft: wp(8) },
  badge: { position: 'absolute', top: -wp(2), right: -wp(2), backgroundColor: '#EF4444', minWidth: wp(15), height: wp(15), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(2) },
  badgeT: { color: '#fff', fontSize: fp(8), fontWeight: '700' },

  catWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, paddingTop: wp(10), paddingBottom: wp(2) },
  catChip: { paddingHorizontal: wp(12), paddingVertical: wp(5), borderRadius: BorderRadius.full, borderWidth: 1, marginRight: wp(7), marginBottom: wp(7) },
  catText: { fontSize: fp(11), fontWeight: '500' },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingVertical: wp(6), borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: wp(4) },
  sortItem: { marginRight: wp(12) },
  sortText: { fontSize: fp(11) },
  countT: { fontSize: fp(10) },

  empty: { paddingTop: wp(50), alignItems: 'center' },
  emptyT: { fontSize: fp(12), marginTop: wp(6) },

  toast: { position: 'absolute', bottom: wp(70), left: 0, right: 0, alignItems: 'center' },
  toastBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(14), paddingVertical: wp(7), borderRadius: wp(18) },
  toastT: { fontSize: fp(12), fontWeight: '500', marginLeft: wp(5) },

  // 卡片通用
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  cardCover: { height: wp(70), justifyContent: 'center', alignItems: 'center' },
  cardIconC: { width: wp(36), height: wp(36), borderRadius: wp(18), justifyContent: 'center', alignItems: 'center' },
  cardTag: { position: 'absolute', top: wp(5), left: wp(5), paddingHorizontal: wp(5), paddingVertical: wp(1), borderRadius: wp(3) },
  cardTagT: { color: '#fff', fontSize: fp(8), fontWeight: '700' },
  cardName: { fontSize: fp(12), fontWeight: '600' },
  cardDesc: { fontSize: fp(10), marginTop: wp(1) },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(8), paddingVertical: wp(6) },
  priceT: { fontSize: fp(14), fontWeight: '800', color: '#EF4444' },
  addBtnS: { width: wp(24), height: wp(24), borderRadius: wp(12), justifyContent: 'center', alignItems: 'center' },

  // 图纸卡片
  patPreview: { height: wp(80), justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg },
  ownedBadge: { position: 'absolute', top: wp(5), right: wp(5), flexDirection: 'row', alignItems: 'center', backgroundColor: '#4b78ff', paddingHorizontal: wp(5), paddingVertical: wp(2), borderRadius: wp(4) },
  ownedBadgeT: { color: '#fff', fontSize: fp(8), fontWeight: '700', marginLeft: wp(2) },
  patMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2) },
  patAuthor: { fontSize: fp(10) },
  patDl: { fontSize: fp(10) },
  patPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: wp(4) },
  freeTag: { backgroundColor: '#DCFCE7', paddingHorizontal: wp(6), paddingVertical: wp(1), borderRadius: wp(4) },
  freeTagT: { color: '#16A34A', fontSize: fp(10), fontWeight: '700' },
  ratingSmall: { flexDirection: 'row', alignItems: 'center' },
  ratingSmallT: { fontSize: fp(10), marginLeft: wp(2) },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: wp(16), borderTopRightRadius: wp(16), padding: wp(18) },
  closeBtn: { width: wp(28), height: wp(28), borderRadius: wp(14), justifyContent: 'center', alignItems: 'center' },

  // 详情通用
  dtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: wp(8) },
  dtIcon: { width: wp(50), height: wp(50), borderRadius: wp(14), justifyContent: 'center', alignItems: 'center' },
  dtName: { fontSize: fp(16), fontWeight: '700' },
  dtDesc: { fontSize: fp(12), marginTop: wp(4), lineHeight: fp(17) },
  dtRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(6) },
  dtRating: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(3) },
  dtSales: { fontSize: fp(11), marginLeft: wp(6) },
  specWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: wp(8) },
  specC: { paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(5), marginRight: wp(6), marginBottom: wp(6) },
  specCT: { fontSize: fp(11) },
  discBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: wp(8), borderRadius: wp(6), marginTop: wp(8) },
  discT: { fontSize: fp(11), fontWeight: '600', color: '#EF4444', marginLeft: wp(5) },
  dtFoot: { flexDirection: 'row', alignItems: 'center', paddingTop: wp(10), marginTop: wp(10), borderTopWidth: StyleSheet.hairlineWidth },
  dtPrice: { fontSize: fp(18), fontWeight: '800', color: '#EF4444' },
  dtPriceOld: { fontSize: fp(11), textDecorationLine: 'line-through', marginLeft: wp(6) },
  dtAddBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(14), paddingVertical: wp(8), borderRadius: wp(8) },
  dtAddBtnT: { color: '#fff', fontSize: fp(12), fontWeight: '600', marginLeft: wp(4) },

  // 图纸详情
  patBigPreview: { alignItems: 'center', paddingVertical: wp(14), borderRadius: BorderRadius.lg, marginVertical: wp(8) },
  patInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: wp(4) },
  patInfoAuthor: { fontSize: fp(13), fontWeight: '600', marginLeft: wp(6) },
  patInfoRating: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(3) },

  // 购物车
  cartHead: { flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) },
  cartHeadT: { fontSize: fp(16), fontWeight: '700' },
  clearT: { fontSize: fp(12), marginLeft: wp(8) },
  cartEmpty: { alignItems: 'center', paddingVertical: wp(24) },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), borderBottomWidth: StyleSheet.hairlineWidth },
  cartRowIcon: { width: wp(32), height: wp(32), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center', marginRight: wp(8) },
  cartRowName: { fontSize: fp(12), fontWeight: '500' },
  cartRowPrice: { fontSize: fp(11), color: '#EF4444', fontWeight: '600', marginTop: wp(1) },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: wp(24), height: wp(24), borderRadius: wp(12), borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyN: { fontSize: fp(12), fontWeight: '600', marginHorizontal: wp(8) },
  cartFoot: { flexDirection: 'row', alignItems: 'center', paddingTop: wp(10), borderTopWidth: StyleSheet.hairlineWidth },
  cartFootL: { fontSize: fp(10) },
  cartFootP: { fontSize: fp(16), fontWeight: '800', color: '#EF4444' },
  checkBtn: { paddingHorizontal: wp(18), paddingVertical: wp(8), borderRadius: wp(8) },
  checkBtnT: { color: '#fff', fontSize: fp(13), fontWeight: '700' },
});
