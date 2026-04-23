import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius, candyShadow } from '../../theme';
import { HoverView } from '../../components/common';
import { Toast } from '../../components/common/Toast';
import { useToast, hapticLight, hapticSuccess } from '../../hooks/useFeedback';
import type { RootScreenProps } from '../../navigation/types';
import client from '../../api/client';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';

const PAD = wp(16);

export const ProductDetailScreen: React.FC<RootScreenProps<'ProductDetail'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const { product } = route.params;
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  const specs: string[] = (() => {
    try { return product.specs ? JSON.parse(product.specs) : []; }
    catch { return []; }
  })();

  const totalPrice = (product.price * qty).toFixed(1);
  const saved = product.originalPrice ? ((product.originalPrice - product.price) * qty).toFixed(1) : null;

  const handleBuy = () => {
    Alert.alert('确认购买', `${product.name} × ${qty}\n合计 ¥${totalPrice} (${Math.ceil(product.price * qty)} 拼豆币)`, [
      { text: '取消', style: 'cancel' },
      { text: '拼豆币支付', onPress: async () => {
        setBuying(true);
        try {
          // TODO: 后端新增材料购买接口，暂用 mock
          hapticSuccess();
          toast.show('购买成功！');
        } catch (e: any) {
          Alert.alert('购买失败', e.message);
        } finally {
          setBuying(false);
        }
      }},
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 导航 */}
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]} numberOfLines={1}>商品详情</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(100) }}>
        {/* 商品大图区 */}
        <View style={[$.coverArea, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : product.color + '10' }]}>
          <View style={[$.iconBig, { backgroundColor: product.color + '20' }]}>
            <Feather name={product.icon as any} size={fp(48)} color={product.color} />
          </View>
          {product.tag ? (
            <View style={[$.tag, { backgroundColor: product.color }]}>
              <Text style={$.tagText}>{product.tag}</Text>
            </View>
          ) : null}
        </View>

        {/* 价格区 */}
        <View style={[$.priceSection, { backgroundColor: colors.surface }]}>
          <View style={$.priceRow}>
            <Text style={$.priceSymbol}>¥</Text>
            <Text style={$.priceVal}>{product.price}</Text>
            {product.originalPrice ? (
              <Text style={[$.priceOld, { color: colors.textHint }]}>¥{product.originalPrice}</Text>
            ) : null}
            {saved ? (
              <View style={$.savedTag}>
                <Text style={$.savedText}>省 ¥{saved}</Text>
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
            <Text style={[$.metaText, { color: colors.textHint }]}>{product.sales > 1000 ? (product.sales / 1000).toFixed(1) + 'k' : product.sales} 人付款</Text>
            <Text style={[$.metaSep, { color: colors.divider }]}>|</Text>
            <Text style={[$.metaText, { color: colors.textHint }]}>{product.category}</Text>
          </View>
        </View>

        {/* 规格 */}
        {specs.length > 0 && (
          <View style={[$.specSection, { backgroundColor: colors.surface }]}>
            <Text style={[$.secTitle, { color: colors.text }]}>规格参数</Text>
            <View style={$.specGrid}>
              {specs.map((s) => (
                <View key={s} style={[$.specChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.specText, { color: colors.textSecondary }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 购买须知 */}
        <View style={[$.infoSection, { backgroundColor: colors.surface }]}>
          <Text style={[$.secTitle, { color: colors.text }]}>购买须知</Text>
          <View style={$.infoRow}>
            <Feather name="truck" size={fp(14)} color={colors.textHint} />
            <Text style={[$.infoText, { color: colors.textSecondary }]}>全国包邮，预计 3-5 天送达</Text>
          </View>
          <View style={$.infoRow}>
            <Feather name="refresh-cw" size={fp(14)} color={colors.textHint} />
            <Text style={[$.infoText, { color: colors.textSecondary }]}>7天无理由退换</Text>
          </View>
          <View style={$.infoRow}>
            <Feather name="shield" size={fp(14)} color={colors.textHint} />
            <Text style={[$.infoText, { color: colors.textSecondary }]}>正品保障，官方直供</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部购买栏 */}
      <View style={[$.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        {/* 数量 */}
        <View style={$.qtyRow}>
          <TouchableOpacity onPress={() => qty > 1 && setQty(qty - 1)} activeOpacity={0.6}
            style={[$.qtyBtn, { borderColor: colors.border }]}>
            <Feather name="minus" size={fp(14)} color={qty <= 1 ? colors.textHint : colors.text} />
          </TouchableOpacity>
          <Text style={[$.qtyNum, { color: colors.text }]}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)} activeOpacity={0.6}
            style={[$.qtyBtn, { borderColor: colors.border }]}>
            <Feather name="plus" size={fp(14)} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={$.totalPrice}>¥{totalPrice}</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={handleBuy} disabled={buying}
          style={[$.buyBtn, { backgroundColor: colors.accent, opacity: buying ? 0.6 : 1 }, candyShadow(colors.accent, 'md')]}>
          <Text style={$.buyBtnText}>{buying ? '支付中...' : '立即购买'}</Text>
        </TouchableOpacity>
      </View>

      <Toast message={toast.msg} />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', height: wp(50), paddingHorizontal: PAD, borderBottomWidth: 1, gap: wp(10) },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center' },

  coverArea: { height: wp(220), justifyContent: 'center', alignItems: 'center' },
  iconBig: { width: wp(90), height: wp(90), borderRadius: wp(45), justifyContent: 'center', alignItems: 'center' },
  tag: { position: 'absolute', top: wp(12), left: wp(12), paddingHorizontal: wp(12), paddingVertical: wp(5), borderRadius: wp(9999) },
  tagText: { color: '#fff', fontSize: fp(12), fontWeight: '700' },

  priceSection: { paddingHorizontal: PAD, paddingVertical: wp(16) },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceSymbol: { color: '#FF6B95', fontSize: fp(16), fontWeight: '700' },
  priceVal: { color: '#FF6B95', fontSize: fp(28), fontWeight: '800', marginLeft: wp(2) },
  priceOld: { fontSize: fp(14), textDecorationLine: 'line-through', marginLeft: wp(8) },
  savedTag: { backgroundColor: '#FFE5EC', paddingHorizontal: wp(10), paddingVertical: wp(3), borderRadius: wp(9999), marginLeft: wp(8) },
  savedText: { color: '#FF6B95', fontSize: fp(11), fontWeight: '700' },

  productName: { fontSize: fp(18), fontWeight: '700', marginTop: wp(10) },
  productDesc: { fontSize: fp(13), marginTop: wp(6), lineHeight: fp(19) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(10) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  metaText: { fontSize: fp(12) },
  metaSep: { marginHorizontal: wp(8), fontSize: fp(12) },

  specSection: { paddingHorizontal: PAD, paddingVertical: wp(14), marginTop: wp(8) },
  secTitle: { fontSize: fp(15), fontWeight: '700', marginBottom: wp(10) },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  specChip: { paddingHorizontal: wp(14), paddingVertical: wp(7), borderRadius: wp(9999), marginRight: wp(8), marginBottom: wp(8) },
  specText: { fontSize: fp(12) },

  infoSection: { paddingHorizontal: PAD, paddingVertical: wp(14), marginTop: wp(8) },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: wp(10), marginTop: wp(8) },
  infoText: { fontSize: fp(13) },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    borderTopWidth: 1,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: wp(32), height: wp(32), borderRadius: wp(16), borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyNum: { fontSize: fp(15), fontWeight: '700', marginHorizontal: wp(12) },
  totalPrice: { color: '#FF6B95', fontSize: fp(18), fontWeight: '800', marginRight: wp(12) },
  buyBtn: { paddingHorizontal: wp(24), paddingVertical: wp(12), borderRadius: wp(9999) },
  buyBtnText: { color: '#fff', fontSize: fp(15), fontWeight: '800', letterSpacing: 1 },
});
