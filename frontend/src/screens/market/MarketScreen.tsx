import React, { memo, useCallback, useMemo, useState } from 'react';
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
import { usePatternStore, type MarketPattern } from '../../store/usePatternStore';
import type { ProductData, RootStackParamList } from '../../navigation/types';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import {
  MARKET_MATERIAL_CATEGORIES,
  MARKET_MATERIAL_SORTS,
  MARKET_PATTERN_CATEGORIES,
  MARKET_PATTERN_SORTS,
  MARKET_TABS_DEF,
  MOCK_PRODUCTS,
  type MockMaterialProduct,
} from '../../mock/app';

const PAD = wp(15);
const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;
const CARD_W = Math.floor((W - PAD * 2 - wp(10)) / 2);

interface CartItem {
  product: MockMaterialProduct;
  qty: number;
}

export const MarketScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [tab, setTab] = useState<'material' | 'pattern'>('material');

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={$.brandRow}>
          <View style={[$.brandDot, { backgroundColor: '#F97316' }]}>
            <Feather name="shopping-bag" size={fp(13)} color="#fff" />
          </View>
          <View>
            <Text style={[$.brandName, { color: colors.text }]}>
              拼豆<Text style={{ color: '#F97316' }}>市场</Text>
            </Text>
            <Text style={[$.brandSub, { color: colors.textHint }]}>材料与图纸都用 mock 数据演示</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={[$.segmentWrap, { backgroundColor: colors.inputBg }]}>
          {MARKET_TABS_DEF.map((item) => {
            const active = tab === item.key;
            return (
              <TouchableOpacity key={item.key} activeOpacity={0.85} onPress={() => setTab(item.key)} style={[$.segmentItem, active && { backgroundColor: colors.accent }]}>
                <Text style={[$.segmentText, { color: active ? '#fff' : colors.textSecondary }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {tab === 'material' ? <MaterialTab colors={colors} dark={dark} /> : <PatternTab colors={colors} dark={dark} />}
    </SafeAreaView>
  );
};

const MaterialTab: React.FC<{ colors: ThemeColors; dark: boolean }> = ({ colors, dark }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [catIdx, setCatIdx] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (catIdx > 0) list = list.filter((item) => item.cat === MARKET_MATERIAL_CATEGORIES[catIdx]);
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.desc.toLowerCase().includes(keyword),
      );
    }
    if (sortIdx === 1) list.sort((a, b) => b.sales - a.sales);
    if (sortIdx === 2) list.sort((a, b) => a.price - b.price);
    if (sortIdx === 3) list.sort((a, b) => b.price - a.price);
    return list;
  }, [catIdx, search, sortIdx]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1200);
  }, []);

  const addToCart = useCallback((product: MockMaterialProduct) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product.id === product.id);
      if (found) {
        return prev.map((item) => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`已加入购物车：${product.name}`);
  }, [showToast]);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) => prev.map((item) => item.product.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  }, []);

  const openDetail = useCallback((product: MockMaterialProduct) => {
    const routeProduct: ProductData = {
      id: product.id,
      name: product.name,
      description: product.desc,
      price: product.price,
      originalPrice: product.originalPrice,
      sales: product.sales,
      rating: product.rating,
      tag: product.tag,
      color: product.color,
      icon: product.icon,
      category: product.cat,
      specs: JSON.stringify(product.specs),
    };
    navigation.navigate('ProductDetail', { product: routeProduct });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[$.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[$.searchBox, { backgroundColor: colors.inputBg }]}>
          <Feather name="search" size={fp(14)} color={colors.textHint} />
          <TextInput
            style={[$.searchInput, { color: colors.text }]}
            placeholder="搜索材料..."
            placeholderTextColor={colors.textHint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={fp(14)} color={colors.textHint} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowCart(true)} activeOpacity={0.75} style={[$.cartIcon, { backgroundColor: colors.inputBg }]}>
          <Feather name="shopping-cart" size={fp(16)} color={colors.text} />
          {cartCount > 0 && <View style={$.badge}><Text style={$.badgeText}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: wp(70) + BOTTOM_SAFE_H }}
        columnWrapperStyle={{ paddingHorizontal: PAD, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View>
            <View style={$.catWrap}>
              {MARKET_MATERIAL_CATEGORIES.map((item, index) => (
                <CatChip key={item} label={item} active={index === catIdx} onPress={() => setCatIdx(index)} colors={colors} />
              ))}
            </View>
            <View style={[$.sortBar, { borderBottomColor: colors.border }]}>
              {MARKET_MATERIAL_SORTS.map((item, index) => (
                <SortBtn key={item} label={item} active={index === sortIdx} onPress={() => setSortIdx(index)} colors={colors} />
              ))}
              <View style={{ flex: 1 }} />
              <Text style={[$.countText, { color: colors.textHint }]}>{filtered.length} 件</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="box" text="没有找到匹配的材料" colors={colors} />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(10) }}>
            <MaterialCard product={item} colors={colors} dark={dark} onOpen={() => openDetail(item)} onAdd={() => addToCart(item)} />
          </View>
        )}
      />

      {toast.length > 0 && (
        <View style={$.toast}>
          <View style={[$.toastBox, { backgroundColor: colors.text }]}>
            <Feather name="check-circle" size={fp(13)} color={colors.bg} />
            <Text style={[$.toastText, { color: colors.bg }]}>{toast}</Text>
          </View>
        </View>
      )}

      <Modal visible={showCart} animationType="fade" transparent onRequestClose={() => setShowCart(false)}>
        <TouchableOpacity style={$.overlay} activeOpacity={1} onPress={() => setShowCart(false)}>
          <View style={[$.sheet, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[$.sheetTitle, { color: colors.text }]}>购物车</Text>
            {cart.length === 0 ? (
              <EmptyState icon="shopping-cart" text="购物车还是空的" colors={colors} />
            ) : (
              <>
                <ScrollView style={{ maxHeight: H * 0.42 }} showsVerticalScrollIndicator={false}>
                  {cart.map((item) => (
                    <View key={item.product.id} style={[$.cartRow, { borderBottomColor: colors.border }]}>
                      <View style={[$.cartIconWrap, { backgroundColor: `${item.product.color}14` }]}>
                        <Feather name={item.product.icon as any} size={fp(16)} color={item.product.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: wp(10) }}>
                        <Text style={[$.cartName, { color: colors.text }]} numberOfLines={1}>{item.product.name}</Text>
                        <Text style={[$.cartPrice, { color: colors.textHint }]}>¥ {item.product.price.toFixed(1)}</Text>
                      </View>
                      <View style={$.qtyRow}>
                        <TouchableOpacity onPress={() => changeQty(item.product.id, -1)} style={[$.qtyBtn, { borderColor: colors.border }]}>
                          <Feather name="minus" size={fp(12)} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[$.qtyNum, { color: colors.text }]}>{item.qty}</Text>
                        <TouchableOpacity onPress={() => changeQty(item.product.id, 1)} style={[$.qtyBtn, { borderColor: colors.border }]}>
                          <Feather name="plus" size={fp(12)} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={$.removeBtn}>
                        <Feather name="trash-2" size={fp(14)} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <View style={[$.sheetFooter, { borderTopColor: colors.border }]}>
                  <Text style={[$.sheetTotal, { color: colors.text }]}>合计 ¥ {cartTotal.toFixed(1)}</Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setShowCart(false);
                      setCart([]);
                      Alert.alert('下单成功', '当前演示环境不接入实际支付。');
                    }}
                    style={[$.checkoutBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={$.checkoutBtnText}>提交订单</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const PatternTab: React.FC<{ colors: ThemeColors; dark: boolean }> = ({ colors, dark }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const listings = usePatternStore((state) => state.listings);
  const buy = usePatternStore((state) => state.buy);
  const hasBought = usePatternStore((state) => state.hasBought);
  const [catIdx, setCatIdx] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<MarketPattern | null>(null);

  const filtered = useMemo(() => {
    let list = [...listings];
    if (catIdx > 0) list = list.filter((item) => item.cat === MARKET_PATTERN_CATEGORIES[catIdx]);
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.author.toLowerCase().includes(keyword),
      );
    }
    if (sortIdx === 1) list.sort((a, b) => b.downloads - a.downloads);
    if (sortIdx === 2) list.sort((a, b) => a.price - b.price);
    if (sortIdx === 3) list = list.filter((item) => item.free);
    return list;
  }, [catIdx, listings, search, sortIdx]);

  const handleUsePattern = useCallback((pattern: MarketPattern) => {
    setDetail(null);
    navigation.navigate('Editor', { mode: 'manual', cols: pattern.cols, rows: pattern.rows });
  }, [navigation]);

  const handleBuy = useCallback((pattern: MarketPattern) => {
    if (hasBought(pattern.id)) {
      handleUsePattern(pattern);
      return;
    }

    if (pattern.free) {
      buy(pattern.id);
      Alert.alert('已获取', `图纸「${pattern.title}」已加入你的图纸列表。`, [
        { text: '稍后再看' },
        { text: '立即制作', onPress: () => handleUsePattern(pattern) },
      ]);
      return;
    }

    Alert.alert('购买图纸', `「${pattern.title}」需要 ¥ ${pattern.price.toFixed(1)}`, [
      { text: '取消', style: 'cancel' },
      {
        text: '购买',
        onPress: () => {
          buy(pattern.id);
          Alert.alert('购买成功', '当前演示环境只记录本地购买状态。', [
            { text: '关闭' },
            { text: '立即制作', onPress: () => handleUsePattern(pattern) },
          ]);
        },
      },
    ]);
  }, [buy, handleUsePattern, hasBought]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[$.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[$.searchBox, { backgroundColor: colors.inputBg, flex: 1 }]}>
          <Feather name="search" size={fp(14)} color={colors.textHint} />
          <TextInput
            style={[$.searchInput, { color: colors.text }]}
            placeholder="搜索图纸或作者..."
            placeholderTextColor={colors.textHint}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: wp(70) + BOTTOM_SAFE_H }}
        columnWrapperStyle={{ paddingHorizontal: PAD, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View>
            <View style={$.catWrap}>
              {MARKET_PATTERN_CATEGORIES.map((item, index) => (
                <CatChip key={item} label={item} active={index === catIdx} onPress={() => setCatIdx(index)} colors={colors} />
              ))}
            </View>
            <View style={[$.sortBar, { borderBottomColor: colors.border }]}>
              {MARKET_PATTERN_SORTS.map((item, index) => (
                <SortBtn key={item} label={item} active={index === sortIdx} onPress={() => setSortIdx(index)} colors={colors} />
              ))}
              <View style={{ flex: 1 }} />
              <Text style={[$.countText, { color: colors.textHint }]}>{filtered.length} 张</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="file" text="没有找到匹配的图纸" colors={colors} />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(10) }}>
            <PatternCard pattern={item} colors={colors} dark={dark} owned={hasBought(item.id)} onOpen={() => setDetail(item)} />
          </View>
        )}
      />

      <Modal visible={!!detail} animationType="fade" transparent onRequestClose={() => setDetail(null)}>
        <TouchableOpacity style={$.overlay} activeOpacity={1} onPress={() => setDetail(null)}>
          <View style={[$.sheet, { backgroundColor: colors.surface, maxHeight: H * 0.78 }]} onStartShouldSetResponder={() => true}>
            {detail && (
              <PatternDetail
                pattern={detail}
                colors={colors}
                dark={dark}
                owned={hasBought(detail.id)}
                onClose={() => setDetail(null)}
                onBuy={() => handleBuy(detail)}
                onMake={() => handleUsePattern(detail)}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const CatChip: React.FC<{ label: string; active: boolean; onPress: () => void; colors: ThemeColors }> = memo(({ label, active, onPress, colors }) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[$.catChip, { backgroundColor: active ? colors.accent : colors.surface, borderColor: active ? colors.accent : colors.border }]}>
    <Text style={[$.catText, { color: active ? '#fff' : colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
));

const SortBtn: React.FC<{ label: string; active: boolean; onPress: () => void; colors: ThemeColors }> = memo(({ label, active, onPress, colors }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={$.sortItem}>
    <Text style={[$.sortText, { color: active ? colors.accent : colors.textHint, fontWeight: active ? '700' : '400' }]}>{label}</Text>
  </TouchableOpacity>
));

const EmptyState: React.FC<{ icon: string; text: string; colors: ThemeColors }> = ({ icon, text, colors }) => (
  <View style={$.empty}>
    <Feather name={icon as any} size={fp(32)} color={colors.textHint} />
    <Text style={[$.emptyText, { color: colors.textHint }]}>{text}</Text>
  </View>
);

const MaterialCard: React.FC<{
  product: MockMaterialProduct;
  colors: ThemeColors;
  dark: boolean;
  onOpen: () => void;
  onAdd: () => void;
}> = memo(({ product, colors, dark, onOpen, onAdd }) => (
  <View style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
    <TouchableOpacity activeOpacity={0.85} onPress={onOpen}>
      <View style={[$.cardCover, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : `${product.color}10` }]}>
        <View style={[$.cardIconCircle, { backgroundColor: `${product.color}18` }]}>
          <Feather name={product.icon as any} size={fp(18)} color={product.color} />
        </View>
        {product.tag ? <View style={[$.cardTag, { backgroundColor: product.color }]}><Text style={$.cardTagText}>{product.tag}</Text></View> : null}
      </View>
    </TouchableOpacity>
    <View style={$.cardBody}>
      <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>
      <Text style={[$.cardDesc, { color: colors.textHint }]} numberOfLines={2}>{product.desc}</Text>
      <View style={$.priceRow}>
        <View>
          <Text style={$.priceText}>¥ {product.price.toFixed(1)}</Text>
          {product.originalPrice ? <Text style={[$.oldPrice, { color: colors.textHint }]}>¥ {product.originalPrice.toFixed(1)}</Text> : null}
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={onAdd} style={[$.addBtn, { backgroundColor: colors.accent }]}>
          <Text style={$.addBtnText}>加入</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

const PatternCard: React.FC<{
  pattern: MarketPattern;
  colors: ThemeColors;
  dark: boolean;
  owned: boolean;
  onOpen: () => void;
}> = memo(({ pattern, colors, dark, owned, onOpen }) => {
  const pixels = ALL_PATTERNS[pattern.patIdx % ALL_PATTERNS.length];
  const beadSize = Math.max(Math.floor((CARD_W - wp(28)) / (pixels[0]?.length || 9)) - 1, 5);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onOpen} style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[$.patternPreview, { backgroundColor: dark ? '#1E2027' : '#F8FAFC' }]}>
        <BeadGrid pixels={pixels} beadSize={Math.min(beadSize, wp(12))} gap={1} round glossy={false} />
        <View style={[$.patternBadge, { backgroundColor: owned ? colors.accent : pattern.free ? '#16A34A' : '#111827' }]}>
          <Text style={$.patternBadgeText}>{owned ? '已拥有' : pattern.free ? '免费' : `¥ ${pattern.price.toFixed(1)}`}</Text>
        </View>
      </View>
      <View style={$.cardBody}>
        <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{pattern.title}</Text>
        <View style={$.authorRow}>
          <Avatar name={pattern.author} size={wp(18)} />
          <Text style={[$.authorText, { color: colors.textHint }]} numberOfLines={1}>{pattern.author}</Text>
        </View>
        <View style={$.metaRow}>
          <Text style={[$.metaText, { color: colors.textHint }]}>{pattern.cols}x{pattern.rows}</Text>
          <Text style={[$.metaText, { color: colors.textHint }]}>{pattern.downloads} 下载</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const PatternDetail: React.FC<{
  pattern: MarketPattern;
  colors: ThemeColors;
  dark: boolean;
  owned: boolean;
  onClose: () => void;
  onBuy: () => void;
  onMake: () => void;
}> = ({ pattern, colors, dark, owned, onClose, onBuy, onMake }) => {
  const pixels = ALL_PATTERNS[pattern.patIdx % ALL_PATTERNS.length];
  const beadSize = Math.max(Math.floor((W - PAD * 4) / (pixels[0]?.length || 9)) - 2, 6);

  return (
    <>
      <View style={$.sheetHeader}>
        <Text style={[$.sheetTitle, { color: colors.text }]}>{pattern.title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={fp(18)} color={colors.textHint} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[$.detailPreview, { backgroundColor: dark ? '#1E2027' : '#F8FAFC' }]}>
          <BeadGrid pixels={pixels} beadSize={Math.min(beadSize, wp(14))} gap={1} round glossy />
        </View>
        <Text style={[$.detailAuthor, { color: colors.textHint }]}>作者：{pattern.author}</Text>
        <Text style={[$.detailDesc, { color: colors.textSecondary }]}>{pattern.desc}</Text>

        <View style={$.detailStats}>
          <DetailStat label="尺寸" value={`${pattern.cols}x${pattern.rows}`} colors={colors} />
          <DetailStat label="分类" value={pattern.cat} colors={colors} />
          <DetailStat label="下载" value={String(pattern.downloads)} colors={colors} />
          <DetailStat label="评分" value={pattern.rating.toFixed(1)} colors={colors} />
        </View>
      </ScrollView>

      <View style={[$.sheetFooter, { borderTopColor: colors.border }]}>
        {owned ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onMake} style={[$.checkoutBtn, { backgroundColor: colors.accent }]}>
            <Text style={$.checkoutBtnText}>立即制作</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.85} onPress={onBuy} style={[$.checkoutBtn, { backgroundColor: pattern.free ? '#16A34A' : colors.accent }]}>
            <Text style={$.checkoutBtnText}>{pattern.free ? '免费获取' : `购买 ¥ ${pattern.price.toFixed(1)}`}</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const DetailStat: React.FC<{ label: string; value: string; colors: ThemeColors }> = ({ label, value, colors }) => (
  <View style={[$.detailStat, { backgroundColor: colors.inputBg }]}>
    <Text style={[$.detailStatLabel, { color: colors.textHint }]}>{label}</Text>
    <Text style={[$.detailStatValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(50),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(8),
  },
  brandName: { fontSize: fp(17), fontWeight: '900' },
  brandSub: { fontSize: fp(9), marginTop: wp(1) },
  segmentWrap: {
    flexDirection: 'row',
    borderRadius: wp(14),
    padding: wp(2),
  },
  segmentItem: {
    minWidth: wp(66),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: wp(7),
    borderRadius: wp(12),
  },
  segmentText: { fontSize: fp(11), fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: wp(10),
    borderBottomWidth: 1,
    gap: wp(10),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(12),
    paddingHorizontal: wp(12),
    minHeight: wp(40),
  },
  searchInput: { flex: 1, marginLeft: wp(8), fontSize: fp(13) },
  cartIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: wp(6),
    top: wp(5),
    minWidth: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(4),
  },
  badgeText: { color: '#fff', fontSize: fp(9), fontWeight: '700' },
  catWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    paddingHorizontal: PAD,
    paddingTop: wp(12),
    paddingBottom: wp(10),
  },
  catChip: {
    paddingHorizontal: wp(12),
    paddingVertical: wp(7),
    borderRadius: wp(999),
    borderWidth: 1,
  },
  catText: { fontSize: fp(11), fontWeight: '600' },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingBottom: wp(10),
    borderBottomWidth: 1,
  },
  sortItem: { marginRight: wp(14) },
  sortText: { fontSize: fp(11) },
  countText: { fontSize: fp(11) },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardCover: {
    height: wp(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTag: {
    position: 'absolute',
    top: wp(10),
    left: wp(10),
    paddingHorizontal: wp(8),
    paddingVertical: wp(4),
    borderRadius: wp(8),
  },
  cardTagText: { color: '#fff', fontSize: fp(10), fontWeight: '700' },
  cardBody: { padding: wp(10) },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700' },
  cardDesc: { marginTop: wp(6), fontSize: fp(11), lineHeight: fp(16) },
  priceRow: { marginTop: wp(10), flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  priceText: { color: '#EF4444', fontSize: fp(16), fontWeight: '800' },
  oldPrice: { marginTop: wp(2), fontSize: fp(10), textDecorationLine: 'line-through' },
  addBtn: {
    paddingHorizontal: wp(12),
    paddingVertical: wp(7),
    borderRadius: wp(10),
  },
  addBtnText: { color: '#fff', fontSize: fp(11), fontWeight: '700' },
  patternPreview: {
    height: wp(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternBadge: {
    position: 'absolute',
    left: wp(10),
    top: wp(10),
    borderRadius: wp(8),
    paddingHorizontal: wp(8),
    paddingVertical: wp(4),
  },
  patternBadgeText: { color: '#fff', fontSize: fp(10), fontWeight: '700' },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(8), gap: wp(6) },
  authorText: { flex: 1, fontSize: fp(11) },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(8) },
  metaText: { fontSize: fp(10) },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(48) },
  emptyText: { marginTop: wp(12), fontSize: fp(13) },
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: wp(24) + BOTTOM_SAFE_H,
    alignItems: 'center',
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    borderRadius: wp(999),
    paddingHorizontal: wp(12),
    paddingVertical: wp(8),
  },
  toastText: { fontSize: fp(11), fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.24)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    paddingHorizontal: PAD,
    paddingTop: wp(16),
    paddingBottom: wp(16) + BOTTOM_SAFE_H,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: wp(12),
  },
  sheetTitle: { fontSize: fp(16), fontWeight: '800' },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(12),
    borderBottomWidth: 1,
  },
  cartIconWrap: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartName: { fontSize: fp(12), fontWeight: '700' },
  cartPrice: { marginTop: wp(3), fontSize: fp(11) },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
  qtyBtn: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: { minWidth: wp(18), textAlign: 'center', fontSize: fp(12), fontWeight: '700' },
  removeBtn: { marginLeft: wp(10), padding: wp(4) },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: wp(12),
    marginTop: wp(12),
    borderTopWidth: 1,
    gap: wp(12),
  },
  sheetTotal: { flex: 1, fontSize: fp(14), fontWeight: '700' },
  checkoutBtn: {
    minHeight: wp(42),
    paddingHorizontal: wp(18),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: fp(13), fontWeight: '700' },
  detailPreview: {
    borderRadius: wp(18),
    paddingVertical: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAuthor: { marginTop: wp(14), fontSize: fp(12) },
  detailDesc: { marginTop: wp(10), fontSize: fp(13), lineHeight: fp(18) },
  detailStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    marginTop: wp(14),
  },
  detailStat: {
    width: (W - PAD * 2 - wp(8)) / 2,
    borderRadius: wp(14),
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
  },
  detailStatLabel: { fontSize: fp(11) },
  detailStatValue: { marginTop: wp(4), fontSize: fp(13), fontWeight: '700' },
});
