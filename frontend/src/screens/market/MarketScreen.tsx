import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  RefreshControl,
  ScrollView,
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
import { FilterChip, Input, StateView, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import type { MaterialProduct } from '../../api/market';
import type { ProductData, RootStackParamList } from '../../navigation/types';
import { MARKET_MATERIAL_CATEGORIES, MOCK_PRODUCTS } from '../../mock/market';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useCartStore } from '../../store/useCartStore';

const PAD = wp(18);
const CARD_W = Math.floor((Dimensions.get('window').width - PAD * 2 - wp(12)) / 2);
const FLOAT_SIZE = wp(42);

const MATERIAL_SORT_OPTIONS = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price', label: '价格' },
] as const;

export const MarketScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.qty, 0));
  const [catIdx, setCatIdx] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [priceSortOrder, setPriceSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const floatingPosition = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const floatingPositionRef = React.useRef({ x: 0, y: 0 });
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const initializedRef = React.useRef(false);
  const suppressPressRef = React.useRef(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    if (catIdx > 0) {
      list = list.filter((item) => item.cat === MARKET_MATERIAL_CATEGORIES[catIdx]);
    }

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword));
    }

    if (sortIdx === 1) {
      list.sort((a, b) => b.sales - a.sales);
    }

    if (sortIdx === 2) {
      list.sort((a, b) => (priceSortOrder === 'asc' ? a.price - b.price : b.price - a.price));
    }

    return list;
  }, [catIdx, priceSortOrder, search, sortIdx]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRefreshing(false);
  }, [refreshing]);

  const openDetail = useCallback((product: MaterialProduct) => {
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
        <Input
          placeholder="搜索材料、工具或配件"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          prefix={<Feather name="search" size={fp(14)} color={searchFocused ? colors.accent : colors.textHint} />}
          containerStyle={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.border }]}
          style={searchFocused ? { borderColor: colors.accent, backgroundColor: colors.surface } : undefined}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
        ListHeaderComponent={(
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {MARKET_MATERIAL_CATEGORIES.map((item, index) => (
                <FilterChip key={item} label={item} active={index === catIdx} onPress={() => setCatIdx(index)} size="md" />
              ))}
            </ScrollView>

            <View style={styles.sortRow}>
              {MATERIAL_SORT_OPTIONS.map((item, index) => {
                const active = index === sortIdx;
                const isPrice = item.key === 'price';

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (isPrice) {
                        if (sortIdx === index) {
                          setPriceSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortIdx(index);
                          setPriceSortOrder('asc');
                        }
                        return;
                      }

                      setSortIdx(index);
                    }}
                    style={styles.sortItem}
                  >
                    <View style={styles.sortTextRow}>
                      <Text
                        style={[
                          styles.sortText,
                          {
                            color: active ? colors.accent : colors.textHint,
                            fontWeight: active ? '800' : '600',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isPrice ? (
                        <Feather
                          name={priceSortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                          size={fp(11)}
                          color={active ? colors.accent : colors.textHint}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={{ flex: 1 }} />
              <Text style={[styles.countText, { color: colors.textHint }]}>{filtered.length} 件</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<StateView empty emptyText="没有找到匹配的材料" />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W, marginBottom: wp(12) }}>
            <MaterialCard product={item} onOpen={() => openDetail(item)} />
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
          style={[styles.floatingCartButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Feather name="shopping-cart" size={fp(18)} color={colors.textSecondary} />
          {cartCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
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
}> = memo(({ product, onOpen }) => {
  const { colors } = useTheme();

  return (
    <SurfaceCard style={styles.card} bodyStyle={styles.cardBody}>
      <TouchableOpacity activeOpacity={0.85} onPress={onOpen}>
        <View style={[styles.cardCover, { backgroundColor: `${product.color}10` }]}>
          <View style={[styles.cardIconCircle, { backgroundColor: `${product.color}18` }]}>
            <Feather name={product.icon as any} size={fp(18)} color={product.color} />
          </View>
        </View>
      </TouchableOpacity>
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceText, { color: colors.error }]}>¥ {product.price.toFixed(1)}</Text>
        <Text style={[styles.salesText, { color: colors.textHint }]}>销量 {product.sales}</Text>
      </View>
    </SurfaceCard>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: PAD,
    paddingTop: wp(8),
    paddingBottom: wp(14),
    gap: wp(10),
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
    ...shadow(10, 22, 0.12, '#1D3D6B', 8),
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
    minHeight: wp(34),
    borderWidth: 1,
    borderRadius: wp(999),
  },
  listContent: {
    paddingHorizontal: PAD,
    paddingBottom: wp(40) + BOTTOM_SAFE_H,
  },
  columnRow: {
    justifyContent: 'space-between',
    gap: wp(12),
  },
  chipRow: {
    gap: wp(10),
    paddingBottom: wp(14),
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(14),
  },
  sortItem: {
    marginRight: wp(14),
  },
  sortTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  sortText: {
    fontSize: fp(12),
  },
  countText: {
    fontSize: fp(11),
  },
  card: {
    borderRadius: wp(24),
    ...shadow(10, 24, 0.06, '#1D3D6B', 6),
  },
  cardBody: {
    gap: wp(8),
  },
  cardCover: {
    aspectRatio: 1,
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardIconCircle: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fp(13),
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: fp(15),
    fontWeight: '800',
  },
  salesText: {
    fontSize: fp(11),
    fontWeight: '600',
  },
});
