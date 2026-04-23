import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { RootScreenProps } from '../../navigation/types';
import { fp, wp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useCartStore } from '../../store/useCartStore';
import { useAddressStore } from '../../store/useAddressStore';

const PAD = wp(16);
const HERO_SIZE = wp(300);

export const ProductDetailScreen: React.FC<RootScreenProps<'ProductDetail'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { product } = route.params;
  const addItem = useCartStore((state) => state.addItem);
  const defaultAddress = useAddressStore((state) => state.addresses.find((item) => item.isDefault) || state.addresses[0]);

  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const heroScrollRef = useRef<ScrollView | null>(null);

  const specs = useMemo(() => {
    if (!product.specs) return ['默认规格'];
    try {
      const parsed = JSON.parse(product.specs) as string[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['默认规格'];
    } catch {
      return ['默认规格'];
    }
  }, [product.specs]);

  const previewItems = useMemo(
    () => [
      { key: 'main', tint: `${product.color}14` },
      { key: 'detail', tint: `${product.color}10` },
      { key: 'match', tint: dark ? '#13233A' : '#F5F9FF' },
      { key: 'scene', tint: dark ? '#13233A' : '#F7FAFC' },
    ],
    [dark, product.color],
  );

  const totalPrice = useMemo(() => (product.price * qty).toFixed(1), [product.price, qty]);
  const salesText = useMemo(
    () => (product.sales > 10000 ? `${(product.sales / 10000).toFixed(1)}万` : `${product.sales}`),
    [product.sales],
  );

  const openSelector = () => setSelectorVisible(true);
  const closeSelector = () => setSelectorVisible(false);

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleHeroScrollEnd = (offsetX: number) => {
    const nextIndex = Math.round(offsetX / HERO_SIZE);
    setSelectedPreview(nextIndex);
  };

  const handleAddToCart = () => {
    addItem(product, { qty, variant: specs[selectedSpec] });
    closeSelector();
    setToastVisible(true);
  };

  const handleBuyNow = () => {
    closeSelector();
    navigation.navigate('Payment', {
      source: 'product',
      product,
      qty,
      variant: specs[selectedSpec],
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.nav, { top: insets.top + wp(8) }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => navigation.goBack()}
          style={[
            styles.navBtn,
            {
              backgroundColor: dark ? 'rgba(15,29,49,0.92)' : 'rgba(255,255,255,0.96)',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.navRight}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => setLiked((value) => !value)}
            style={[
              styles.navBtn,
              {
                backgroundColor: dark ? 'rgba(15,29,49,0.92)' : 'rgba(255,255,255,0.96)',
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="heart" size={fp(17)} color={liked ? colors.error : colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => Alert.alert('分享', '当前演示环境未接入系统分享。')}
            style={[
              styles.navBtn,
              {
                backgroundColor: dark ? 'rgba(15,29,49,0.92)' : 'rgba(255,255,255,0.96)',
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="share-2" size={fp(17)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(118) + BOTTOM_SAFE_H }}>
        <View style={[styles.hero, { backgroundColor: dark ? '#0B182B' : '#EEF5FF', paddingTop: insets.top + wp(56) }]}>
          <View style={styles.heroViewport}>
            <ScrollView
              ref={heroScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              snapToInterval={HERO_SIZE}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => handleHeroScrollEnd(event.nativeEvent.contentOffset.x)}
            >
              {previewItems.map((item) => (
                <View key={item.key} style={[styles.heroVisual, { backgroundColor: item.tint }]}>
                  <View style={[styles.heroCore, { backgroundColor: `${product.color}22` }]}>
                    <Feather name={product.icon as any} size={fp(64)} color={product.color} />
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.heroDots}>
              {previewItems.map((item, index) => {
                const active = index === selectedPreview;
                return (
                  <View
                    key={`${item.key}-dot`}
                    style={[
                      styles.heroDot,
                      {
                        width: active ? wp(18) : wp(6),
                        backgroundColor: active ? product.color : `${product.color}33`,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.priceRow}>
              <View style={styles.priceMain}>
                <Text style={styles.priceSymbol}>¥</Text>
                <Text style={styles.priceValue}>{product.price.toFixed(1)}</Text>
                {product.originalPrice ? (
                  <Text style={[styles.oldPrice, { color: colors.textHint }]}>¥ {product.originalPrice.toFixed(1)}</Text>
                ) : null}
              </View>
              <Text style={[styles.salesInline, { color: colors.textHint }]}>销量 {salesText}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{product.description}</Text>

            <View style={styles.benefitWrap}>
              <View style={styles.orangeChip}>
                <Text style={styles.orangeChipText}>满 2 件 9.8 折</Text>
              </View>
            </View>

            <View style={styles.categorySection}>
              <View style={styles.categoryHead}>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>品类选择</Text>
                <Text style={[styles.categoryHint, { color: colors.textSecondary }]}>
                  已选 {specs[selectedSpec]}
                </Text>
              </View>

              <View style={styles.categoryRow}>
                {specs.map((spec, index) => {
                  const active = index === selectedSpec;
                  return (
                    <TouchableOpacity
                      key={`${spec}-${index}`}
                      activeOpacity={0.82}
                      onPress={() => setSelectedSpec(index)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: active ? '#FFF7F1' : dark ? '#13233A' : '#FFFFFF',
                          borderColor: active ? '#FF8A3D' : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: active ? '#FF7A1A' : colors.textSecondary },
                        ]}
                      >
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <View style={styles.tools}>
          <TouchableOpacity activeOpacity={0.78} onPress={() => setLiked((value) => !value)} style={styles.tool}>
            <Feather name="heart" size={fp(18)} color={liked ? colors.error : colors.text} />
            <Text style={[styles.toolText, { color: liked ? colors.error : colors.textHint }]}>收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.78} onPress={() => Alert.alert('客服', '当前演示环境未接入在线客服。')} style={styles.tool}>
            <Feather name="message-circle" size={fp(18)} color={colors.text} />
            <Text style={[styles.toolText, { color: colors.textHint }]}>客服</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.78} onPress={() => navigation.navigate('Cart')} style={styles.tool}>
            <Feather name="shopping-cart" size={fp(18)} color={colors.text} />
            <Text style={[styles.toolText, { color: colors.textHint }]}>购物车</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.86} onPress={openSelector} style={styles.cartAction}>
            <Text style={styles.actionText}>加入购物车</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.86} onPress={openSelector} style={styles.buyAction}>
            <Text style={styles.actionText}>立即购买</Text>
          </TouchableOpacity>
        </View>
      </View>

      {toastVisible ? (
        <View pointerEvents="none" style={[styles.toastWrap, { bottom: wp(96) + BOTTOM_SAFE_H }]}>
          <View style={[styles.toast, { backgroundColor: dark ? 'rgba(15,29,49,0.96)' : 'rgba(19,36,61,0.9)' }]}>
            <Feather name="check-circle" size={fp(15)} color="#FFFFFF" />
            <Text style={styles.toastText}>已加入购物车</Text>
          </View>
        </View>
      ) : null}

      <Modal visible={selectorVisible} transparent animationType="slide" onRequestClose={closeSelector}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.mask} activeOpacity={1} onPress={closeSelector} />

          <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, wp(16)) }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetHint, { color: '#F97316' }]}>选择规格后可加入购物车，也可以直接去支付。</Text>
              <TouchableOpacity activeOpacity={0.78} onPress={closeSelector}>
                <Feather name="x" size={fp(22)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('AddressManage')}
              style={[styles.addressRow, { borderBottomColor: colors.divider }]}
            >
              <Feather name="map-pin" size={fp(16)} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.addressTitle, { color: colors.text }]}>
                  {defaultAddress ? `默认地址 · ${defaultAddress.region} ${defaultAddress.detail}` : '默认地址 · 请先设置收货地址'}
                </Text>
                <Text style={[styles.addressSub, { color: colors.textSecondary }]}>
                  {defaultAddress
                    ? `${defaultAddress.receiver} ${defaultAddress.phone} · 包邮 · 预计明天发货`
                    : '包邮 · 预计明天发货 · 支持 7 天退换'}
                </Text>
              </View>
              <Feather name="chevron-right" size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>

            <View style={styles.productRow}>
              <View style={[styles.productThumb, { backgroundColor: previewItems[selectedPreview].tint, borderColor: `${product.color}22` }]}>
                <Feather name={product.icon as any} size={fp(30)} color={product.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sheetPrice}>¥ {totalPrice}</Text>
                <View style={styles.promoRow}>
                  <View style={styles.orangeChip}>
                    <Text style={styles.orangeChipText}>满 2 件 9.8 折</Text>
                  </View>
                </View>
                <View style={styles.qtySheetRow}>
                  <View style={styles.qtySheetBox}>
                    <TouchableOpacity activeOpacity={0.78} onPress={() => qty > 1 && setQty(qty - 1)} style={styles.qtySheetBtn}>
                      <Feather name="minus" size={fp(12)} color="#334155" />
                    </TouchableOpacity>
                    <Text style={styles.qtySheetNum}>{qty}</Text>
                    <TouchableOpacity activeOpacity={0.78} onPress={() => setQty(qty + 1)} style={styles.qtySheetBtn}>
                      <Feather name="plus" size={fp(12)} color="#334155" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.stockText, { color: colors.textSecondary }]}>有货</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sheetTitle, { color: colors.text }]}>规格</Text>
            <View style={styles.specRow}>
              {specs.map((spec, index) => (
                <TouchableOpacity
                  key={`${spec}-${index}`}
                  activeOpacity={0.82}
                  onPress={() => setSelectedSpec(index)}
                  style={[
                    styles.specOption,
                    {
                      backgroundColor: index === selectedSpec ? '#FFF7F1' : dark ? '#13233A' : '#F7F9FC',
                      borderColor: index === selectedSpec ? '#FF8A3D' : colors.border,
                    },
                  ]}
                >
                  {index === selectedSpec ? (
                    <View style={styles.specActiveBadge}>
                      <Feather name="check" size={fp(10)} color="#FFFFFF" />
                    </View>
                  ) : null}
                  <Text style={[styles.specOptionText, { color: index === selectedSpec ? '#FF7A1A' : colors.text }]}>{spec}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetActionRow}>
              <TouchableOpacity activeOpacity={0.86} onPress={handleAddToCart} style={styles.sheetCartAction}>
                <Text style={styles.sheetActionText}>加入购物车</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.86} onPress={handleBuyNow} style={styles.sheetBuyAction}>
                <Text style={styles.sheetActionText}>立即购买</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    position: 'absolute',
    left: PAD,
    right: PAD,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navRight: { flexDirection: 'row', gap: wp(10) },
  navBtn: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(6, 14, 0.08, '#0F172A', 4),
  },
  hero: {
    paddingHorizontal: PAD,
    paddingBottom: wp(18),
  },
  heroViewport: {
    width: HERO_SIZE,
    alignItems: 'center',
    alignSelf: 'center',
  },
  heroVisual: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCore: {
    width: wp(128),
    height: wp(128),
    borderRadius: wp(64),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    marginTop: wp(14),
  },
  heroDot: {
    height: wp(6),
    borderRadius: wp(999),
  },
  heroInfo: {
    marginTop: wp(18),
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceMain: { flexDirection: 'row', alignItems: 'baseline' },
  priceSymbol: { color: '#FF4D4F', fontSize: fp(16), fontWeight: '800' },
  priceValue: { color: '#FF4D4F', fontSize: fp(24), fontWeight: '800', marginLeft: wp(2) },
  oldPrice: { fontSize: fp(13), textDecorationLine: 'line-through', marginLeft: wp(8) },
  salesInline: { fontSize: fp(11), fontWeight: '500' },
  title: { fontSize: fp(16), fontWeight: '800', marginTop: wp(10) },
  desc: { fontSize: fp(13), marginTop: wp(8), lineHeight: fp(20) },
  benefitWrap: { marginTop: wp(12), alignItems: 'flex-start' },
  categorySection: {
    marginTop: wp(20),
  },
  categoryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  categoryTitle: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  categoryHint: {
    fontSize: fp(11),
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
    marginTop: wp(12),
  },
  categoryChip: {
    minHeight: wp(38),
    paddingHorizontal: wp(14),
    borderRadius: wp(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  orangeChip: {
    backgroundColor: '#FFF5EC',
    paddingHorizontal: wp(9),
    paddingVertical: wp(5),
    borderRadius: wp(10),
  },
  orangeChipText: { color: '#FF7A1A', fontSize: fp(11), fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: PAD,
    paddingRight: PAD,
    paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    gap: wp(12),
  },
  tools: { flexDirection: 'row', alignItems: 'center', gap: wp(14) },
  tool: { alignItems: 'center', justifyContent: 'center', minWidth: wp(34) },
  toolText: { fontSize: fp(10), marginTop: wp(4) },
  actions: { flex: 1, flexDirection: 'row', gap: wp(10) },
  cartAction: {
    flex: 1,
    height: wp(42),
    borderRadius: wp(21),
    backgroundColor: '#FFB648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyAction: {
    flex: 1,
    height: wp(42),
    borderRadius: wp(21),
    backgroundColor: '#FF5E73',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontSize: fp(14), fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  mask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.3)' },
  sheet: {
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingTop: wp(14),
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingBottom: wp(12),
  },
  sheetHint: {
    flex: 1,
    fontSize: fp(12),
    fontWeight: '700',
    lineHeight: fp(18),
    paddingRight: wp(10),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    paddingHorizontal: PAD,
    paddingBottom: wp(14),
    borderBottomWidth: 1,
  },
  addressTitle: { fontSize: fp(14), fontWeight: '700' },
  addressSub: { fontSize: fp(12), marginTop: wp(4) },
  productRow: { flexDirection: 'row', paddingHorizontal: PAD, paddingTop: wp(16) },
  productThumb: {
    width: wp(82),
    height: wp(82),
    borderRadius: wp(16),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  sheetPrice: { color: '#FF5A1F', fontSize: fp(28), fontWeight: '800' },
  promoRow: { flexDirection: 'row', gap: wp(8), marginTop: wp(6) },
  qtySheetRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(10) },
  qtySheetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: wp(10),
    overflow: 'hidden',
  },
  qtySheetBtn: { width: wp(34), height: wp(30), alignItems: 'center', justifyContent: 'center' },
  qtySheetNum: { width: wp(36), textAlign: 'center', fontSize: fp(14), fontWeight: '700', color: '#334155' },
  stockText: { marginLeft: wp(12), fontSize: fp(12), fontWeight: '600' },
  sheetTitle: {
    fontSize: fp(14),
    fontWeight: '800',
    marginTop: wp(16),
    marginBottom: wp(12),
    paddingHorizontal: PAD,
  },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(10), paddingHorizontal: PAD },
  specOption: {
    minHeight: wp(44),
    paddingHorizontal: wp(14),
    borderRadius: wp(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  specOptionText: { fontSize: fp(13), fontWeight: '700' },
  specActiveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: wp(20),
    height: wp(20),
    borderBottomLeftRadius: wp(10),
    backgroundColor: '#FF8A3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActionRow: {
    flexDirection: 'row',
    marginTop: wp(18),
    marginHorizontal: PAD,
    borderRadius: wp(16),
    overflow: 'hidden',
  },
  sheetCartAction: {
    flex: 1,
    backgroundColor: '#FFB648',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(12),
  },
  sheetBuyAction: {
    flex: 1,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(12),
  },
  sheetActionText: {
    color: '#FFFFFF',
    fontSize: fp(15),
    fontWeight: '800',
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    minHeight: wp(40),
    borderRadius: wp(20),
    paddingHorizontal: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    ...shadow(8, 18, 0.18, '#0F172A', 6),
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: fp(12),
    fontWeight: '700',
  },
});
