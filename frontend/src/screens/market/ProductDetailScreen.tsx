import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HoverView } from '../../components/common';
import type { RootScreenProps } from '../../navigation/types';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';

const PAD = wp(16);

export const ProductDetailScreen: React.FC<RootScreenProps<'ProductDetail'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const { product } = route.params;
  const [qty, setQty] = useState(1);

  const specs = useMemo(() => {
    try {
      return product.specs ? JSON.parse(product.specs) as string[] : [];
    } catch {
      return [];
    }
  }, [product.specs]);

  const totalPrice = (product.price * qty).toFixed(1);
  const saved = product.originalPrice ? ((product.originalPrice - product.price) * qty).toFixed(1) : null;

  const handleBuy = () => {
    Alert.alert('确认购买', `${product.name} x ${qty}\n合计 ¥ ${totalPrice}`, [
      { text: '取消', style: 'cancel' },
      { text: '购买', onPress: () => Alert.alert('下单成功', '当前演示环境不接入真实支付。') },
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.08} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]} numberOfLines={1}>商品详情</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(112) }}>
        <View style={[$.coverArea, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : `${product.color}10` }]}>
          <View style={[$.iconBig, { backgroundColor: `${product.color}20` }]}>
            <Feather name={product.icon as any} size={fp(48)} color={product.color} />
          </View>
          {product.tag ? (
            <View style={[$.tag, { backgroundColor: product.color }]}>
              <Text style={$.tagText}>{product.tag}</Text>
            </View>
          ) : null}
        </View>

        <View style={[$.priceSection, { backgroundColor: colors.surface }]}>
          <View style={$.priceRow}>
            <Text style={$.priceSymbol}>¥</Text>
            <Text style={$.priceVal}>{product.price.toFixed(1)}</Text>
            {product.originalPrice ? <Text style={[$.priceOld, { color: colors.textHint }]}>¥ {product.originalPrice.toFixed(1)}</Text> : null}
            {saved ? (
              <View style={$.savedTag}>
                <Text style={$.savedText}>省 ¥ {saved}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[$.productName, { color: colors.text }]}>{product.name}</Text>
          <Text style={[$.productDesc, { color: colors.textSecondary }]}>{product.description}</Text>
          <View style={$.metaRow}>
            <View style={$.metaItem}>
              <Feather name="star" size={fp(12)} color="#FBBF24" />
              <Text style={[$.metaText, { color: colors.text }]}>{product.rating}</Text>
            </View>
            <Text style={[$.metaSep, { color: colors.divider }]}>|</Text>
            <Text style={[$.metaText, { color: colors.textHint }]}>{product.sales > 1000 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales} 人购买</Text>
            <Text style={[$.metaSep, { color: colors.divider }]}>|</Text>
            <Text style={[$.metaText, { color: colors.textHint }]}>{product.category}</Text>
          </View>
        </View>

        {specs.length > 0 && (
          <View style={[$.specSection, { backgroundColor: colors.surface }]}>
            <Text style={[$.sectionTitle, { color: colors.text }]}>规格参数</Text>
            <View style={$.specGrid}>
              {specs.map((spec) => (
                <View key={spec} style={[$.specChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.specText, { color: colors.textSecondary }]}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[$.infoSection, { backgroundColor: colors.surface }]}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>购买说明</Text>
          {[
            { icon: 'truck', text: '演示环境不接入真实物流，订单不会实际发货。' },
            { icon: 'refresh-cw', text: '购物车和购买状态只保存在本地会话中。' },
            { icon: 'shield', text: '当前页面仅用于前端交互展示与排版验证。' },
          ].map((item) => (
            <View key={item.text} style={$.infoRow}>
              <Feather name={item.icon as any} size={fp(14)} color={colors.textHint} />
              <Text style={[$.infoText, { color: colors.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[$.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <View style={$.qtyRow}>
          <TouchableOpacity onPress={() => qty > 1 && setQty(qty - 1)} activeOpacity={0.75} style={[$.qtyBtn, { borderColor: colors.border }]}>
            <Feather name="minus" size={fp(14)} color={qty <= 1 ? colors.textHint : colors.text} />
          </TouchableOpacity>
          <Text style={[$.qtyNum, { color: colors.text }]}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)} activeOpacity={0.75} style={[$.qtyBtn, { borderColor: colors.border }]}>
            <Feather name="plus" size={fp(14)} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={$.totalPrice}>¥ {totalPrice}</Text>

        <TouchableOpacity activeOpacity={0.85} onPress={handleBuy} style={[$.buyBtn, { backgroundColor: colors.accent }]}>
          <Text style={$.buyBtnText}>立即购买</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(50),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
    gap: wp(10),
  },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center' },
  coverArea: { height: wp(220), justifyContent: 'center', alignItems: 'center' },
  iconBig: { width: wp(90), height: wp(90), borderRadius: wp(45), justifyContent: 'center', alignItems: 'center' },
  tag: { position: 'absolute', top: wp(12), left: wp(12), paddingHorizontal: wp(10), paddingVertical: wp(4), borderRadius: wp(6) },
  tagText: { color: '#fff', fontSize: fp(12), fontWeight: '700' },
  priceSection: { paddingHorizontal: PAD, paddingVertical: wp(16) },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceSymbol: { color: '#EF4444', fontSize: fp(16), fontWeight: '700' },
  priceVal: { color: '#EF4444', fontSize: fp(28), fontWeight: '800', marginLeft: wp(2) },
  priceOld: { fontSize: fp(14), textDecorationLine: 'line-through', marginLeft: wp(8) },
  savedTag: { backgroundColor: '#FEF2F2', paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: wp(4), marginLeft: wp(8) },
  savedText: { color: '#EF4444', fontSize: fp(11), fontWeight: '600' },
  productName: { fontSize: fp(18), fontWeight: '700', marginTop: wp(10) },
  productDesc: { fontSize: fp(13), marginTop: wp(6), lineHeight: fp(19) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(10) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  metaText: { fontSize: fp(12) },
  metaSep: { marginHorizontal: wp(8), fontSize: fp(12) },
  specSection: { paddingHorizontal: PAD, paddingVertical: wp(14), marginTop: wp(8) },
  sectionTitle: { fontSize: fp(15), fontWeight: '700', marginBottom: wp(10) },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) },
  specChip: { paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8) },
  specText: { fontSize: fp(12) },
  infoSection: { paddingHorizontal: PAD, paddingVertical: wp(14), marginTop: wp(8) },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: wp(10), marginTop: wp(8) },
  infoText: { flex: 1, fontSize: fp(13), lineHeight: fp(18) },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    borderTopWidth: 1,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: wp(30), height: wp(30), borderRadius: wp(15), borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyNum: { fontSize: fp(15), fontWeight: '700', marginHorizontal: wp(12) },
  totalPrice: { color: '#EF4444', fontSize: fp(18), fontWeight: '800', marginRight: wp(12) },
  buyBtn: { paddingHorizontal: wp(22), paddingVertical: wp(11), borderRadius: wp(12) },
  buyBtnText: { color: '#fff', fontSize: fp(15), fontWeight: '700' },
});
