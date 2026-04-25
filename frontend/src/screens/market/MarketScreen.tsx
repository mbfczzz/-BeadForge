import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { marketApi, productDataToMaterialProduct, type MaterialProduct } from '../../api/market';
// （旧）mock 商品数据已移除：商品全部走 marketApi.getProducts
import type { ProductData, RootStackParamList } from '../../navigation/types';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useCartStore } from '../../store/useCartStore';

const MARKET_RED = '#F2270C';
const MARKET_ORANGE = '#FF8A00';
const PAD = wp(12);
const GAP = wp(8);
const CARD_W = Math.floor((Dimensions.get('window').width - PAD * 2 - GAP) / 2);
const FLOAT_SIZE = wp(42);

function toProductData(product: MaterialProduct): ProductData {
  return {
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
    imageUrls: product.imageUrls,
    services: product.services,
    promotions: product.promotions,
    detailSections: product.detailSections,
  };
}

export const MarketScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.qty, 0));
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<MaterialProduct[]>([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const floatingPosition = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const floatingPositionRef = React.useRef({ x: 0, y: 0 });
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const initializedRef = React.useRef(false);
  const suppressPressRef = React.useRef(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword));
    }

    return list;
  }, [products, search]);

  const loadProducts = useCallback(async () => {
    try {
      const response = await marketApi.getProducts(1, 80);
      const records = response.data?.records || [];
      if (records.length > 0) {
        setProducts(records.map(productDataToMaterialProduct));
      }
    } catch {
      setProducts([]);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts, refreshing]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openDetail = useCallback((product: MaterialProduct) => {
    navigation.navigate('ProductDetail', { product: toProductData(product) });
  }, [navigation]);

  const minX = PAD;
  const maxX = Math.max(PAD, windowWidth - PAD - FLOAT_SIZE);
  const minY = wp(96);
  const maxY = Math.max(minY, windowHeight - wp(180) - BOTTOM_SAFE_H);

  useEffect(() => {
    const nextX = initializedRef.current
      ? Math.min(maxX, Math.max(minX, floatingPositionRef.current.x))
      : maxX;
    const nextY = initializedRef.current
      ? Math.min(maxY, Math.max(minY, floatingPositionRef.current.y))
      : maxY - wp(12);

    floatingPosition.setValue({ x: nextX, y: nextY });
    floatingPositionRef.current = { x: nextX, y: nextY };
    initializedRef.current = true;
  }, [floatingPosition, maxX, maxY, minX, minY]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          dragEnabled && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
        onPanResponderGrant: () => {
          dragStartRef.current = { ...floatingPositionRef.current };
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = Math.min(maxX, Math.max(minX, dragStartRef.current.x + gestureState.dx));
          const nextY = Math.min(maxY, Math.max(minY, dragStartRef.current.y + gestureState.dy));
          floatingPosition.setValue({ x: nextX, y: nextY });
          floatingPositionRef.current = { x: nextX, y: nextY };
        },
        onPanResponderRelease: () => {
          const snapX = floatingPositionRef.current.x + FLOAT_SIZE / 2 < windowWidth / 2 ? minX : maxX;
          const snapY = Math.min(maxY, Math.max(minY, floatingPositionRef.current.y));
          Animated.spring(floatingPosition, {
            toValue: { x: snapX, y: snapY },
            useNativeDriver: false,
            tension: 140,
            friction: 14,
          }).start(() => {
            floatingPositionRef.current = { x: snapX, y: snapY };
          });
          setDragEnabled(false);
          setTimeout(() => {
            suppressPressRef.current = false;
          }, 120);
        },
        onPanResponderTerminate: () => {
          setDragEnabled(false);
          setTimeout(() => {
            suppressPressRef.current = false;
          }, 120);
        },
      }),
    [dragEnabled, floatingPosition, maxX, maxY, minX, minY, windowWidth],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>材料商城</Text>
        </View>
        <Input
          placeholder="搜索材料、工具或配件"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          prefix={<Feather name="search" size={fp(14)} color={searchFocused ? colors.accent : colors.textHint} />}
          containerStyle={[
            styles.searchField,
            {
              backgroundColor: colors.surface,
              borderColor: searchFocused ? MARKET_RED : colors.border,
            },
          ]}
          style={searchFocused ? { borderColor: MARKET_RED, backgroundColor: colors.surface } : undefined}
        />
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnRow}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MARKET_RED} colors={[MARKET_RED]} />
        }
        ListEmptyComponent={<StateView empty emptyText="没有找到匹配的材料" />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(8) }}>
            <MaterialCard
              product={item}
              onOpen={() => openDetail(item)}
              onAdd={() => addItem(toProductData(item), { qty: 1, variant: item.specs[0] || '默认规格' })}
            />
          </View>
        )}
      />

      <Animated.View
        style={[
          styles.floatingCartWrap,
          {
            left: floatingPosition.x,
            top: floatingPosition.y,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.86}
          delayLongPress={220}
          onLongPress={() => {
            suppressPressRef.current = true;
            setDragEnabled(true);
          }}
          onPress={() => {
            if (dragEnabled || suppressPressRef.current) {
              suppressPressRef.current = false;
              return;
            }
            navigation.navigate('Cart');
          }}
          style={[styles.floatingCartButton, { backgroundColor: MARKET_RED, borderColor: MARKET_RED }]}
        >
          <Feather name="shopping-cart" size={fp(18)} color="#FFFFFF" />
          {cartCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: MARKET_ORANGE }]}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const MaterialCard: React.FC<{
  product: MaterialProduct;
  onOpen: () => void;
  onAdd: () => void;
}> = memo(({ product, onOpen, onAdd }) => {
  const { colors } = useTheme();
  const salesText = product.sales > 10000 ? `${(product.sales / 10000).toFixed(1)}万` : `${product.sales}`;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onOpen}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.cardCover, { backgroundColor: `${product.color}10` }]}>
        {product.tag ? (
          <View style={styles.hotTag}>
            <Text style={styles.hotTagText}>{product.tag}</Text>
          </View>
        ) : null}
        <View style={[styles.cardIconCircle, { backgroundColor: `${product.color}18` }]}>
          <Feather name={product.icon as any} size={fp(20)} color={product.color} />
        </View>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.cardMetaRow}>
        <Text style={styles.ratingText}>{product.rating.toFixed(1)}分</Text>
        <Text style={[styles.salesText, { color: colors.textHint }]}>{salesText}人买过</Text>
      </View>
      <View style={styles.priceRow}>
        <View style={styles.priceStack}>
          <Text style={styles.priceText}>¥{product.price.toFixed(1)}</Text>
          {product.originalPrice ? (
            <Text style={[styles.oldPrice, { color: colors.textHint }]}>¥{product.originalPrice.toFixed(1)}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          style={styles.addButton}
        >
          <Feather name="plus" size={fp(14)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: PAD,
    paddingTop: wp(8),
    paddingBottom: wp(8),
    gap: wp(12),
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  headerTitle: {
    fontSize: fp(19),
    fontWeight: '900',
  },
  floatingCartWrap: {
    position: 'absolute',
    zIndex: 10,
  },
  floatingCartButton: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(8, 18, 0.14, MARKET_RED, 8),
  },
  badge: {
    position: 'absolute',
    top: -wp(3),
    right: -wp(3),
    minWidth: wp(18),
    height: wp(18),
    paddingHorizontal: wp(4),
    borderRadius: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fp(9),
    fontWeight: '800',
  },
  searchField: {
    minHeight: wp(42),
    borderWidth: 1,
    borderRadius: wp(16),
  },
  listContent: {
    paddingHorizontal: PAD,
    paddingTop: wp(4),
    paddingBottom: wp(40) + BOTTOM_SAFE_H,
  },
  columnRow: {
    justifyContent: 'space-between',
    gap: GAP,
  },
  card: {
    borderRadius: wp(10),
    borderWidth: 1,
    padding: wp(6),
    ...shadow(1, 4, 0.02, '#0F172A', 0),
  },
  cardCover: {
    aspectRatio: 1,
    borderRadius: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  hotTag: {
    position: 'absolute',
    left: wp(6),
    top: wp(6),
    minHeight: wp(18),
    borderRadius: wp(9),
    backgroundColor: MARKET_RED,
    paddingHorizontal: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotTagText: {
    color: '#FFFFFF',
    fontSize: fp(9),
    fontWeight: '800',
  },
  cardIconCircle: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fp(12),
    fontWeight: '800',
    lineHeight: fp(16),
    minHeight: fp(32),
    marginTop: wp(6),
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginTop: wp(5),
  },
  ratingText: {
    color: MARKET_ORANGE,
    fontSize: fp(9),
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: wp(5),
    gap: wp(6),
  },
  priceStack: {
    flex: 1,
    minWidth: 0,
  },
  priceText: {
    color: MARKET_RED,
    fontSize: fp(14),
    fontWeight: '900',
  },
  oldPrice: {
    fontSize: fp(9),
    textDecorationLine: 'line-through',
    marginTop: wp(1),
  },
  salesText: {
    fontSize: fp(9),
    fontWeight: '600',
  },
  addButton: {
    width: wp(27),
    height: wp(27),
    borderRadius: wp(14),
    backgroundColor: MARKET_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
