import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, Button } from '../../components/common';
import { useTheme } from '../../theme';
import type { RootScreenProps } from '../../navigation/types';
import { fp, wp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useCartStore } from '../../store/useCartStore';
import { useAddressStore } from '../../store/useAddressStore';

const PAD = wp(16);

type PaymentLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  color: string;
  icon: string;
  variant: string;
};

export const PaymentScreen: React.FC<RootScreenProps<'Payment'>> = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const params = route.params;
  const defaultAddress = useAddressStore((state) => state.addresses.find((item) => item.isDefault) || state.addresses[0]);
  const cartItems = useCartStore((state) => state.items);
  const clearSelected = useCartStore((state) => state.clearSelected);

  const paymentItems = useMemo<PaymentLine[]>(() => {
    if (params.source === 'product') {
      return [
        {
          id: `${params.product.id}:${params.variant}`,
          name: params.product.name,
          price: params.product.price,
          qty: params.qty,
          color: params.product.color,
          icon: params.product.icon,
          variant: params.variant,
        },
      ];
    }

    return cartItems
      .filter((item) => params.itemIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        color: item.product.color,
        icon: item.product.icon,
        variant: item.variant,
      }));
  }, [cartItems, params]);

  const totalAmount = useMemo(
    () => paymentItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [paymentItems],
  );

  const handlePay = () => {
    if (!defaultAddress) {
      Alert.alert('提示', '请先设置默认收货地址。');
      return;
    }

    if (paymentItems.length === 0) {
      Alert.alert('提示', '当前没有可支付的商品。');
      return;
    }

    if (params.source === 'cart') {
      clearSelected();
    }

    Alert.alert('支付成功', `实付 ¥${totalAmount.toFixed(1)}`, [
      {
        text: '确定',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="确认支付" onBack={() => navigation.goBack()} />

      <FlatList
        data={paymentItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => navigation.navigate('AddressManage')}
            style={[styles.addressCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.addressIconWrap}>
              <Feather name="map-pin" size={fp(16)} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressTitle, { color: colors.text }]}>
                {defaultAddress
                  ? `${defaultAddress.receiver} ${defaultAddress.phone}`
                  : '请先设置默认收货地址'}
              </Text>
              <Text style={[styles.addressSub, { color: colors.textSecondary }]}>
                {defaultAddress
                  ? `${defaultAddress.region} ${defaultAddress.detail}`
                  : '点击进入地址管理'}
              </Text>
            </View>
            <Feather name="chevron-right" size={fp(16)} color={colors.textHint} />
          </TouchableOpacity>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.thumb, { backgroundColor: `${item.color}14`, borderColor: colors.border }]}>
              <Feather name={item.icon as any} size={fp(24)} color={item.color} />
            </View>

            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.variant, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.variant}
              </Text>
              <View style={styles.lineBottom}>
                <Text style={styles.price}>¥ {item.price.toFixed(1)}</Text>
                <Text style={[styles.qty, { color: colors.textSecondary }]}>x{item.qty}</Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={(
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>商品金额</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>¥ {totalAmount.toFixed(1)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>运费</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>包邮</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowLast]}>
              <Text style={[styles.payLabel, { color: colors.text }]}>实付款</Text>
              <Text style={styles.payAmount}>¥ {totalAmount.toFixed(1)}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>待支付</Text>
          <Text style={styles.footerAmount}>¥ {totalAmount.toFixed(1)}</Text>
        </View>
        <Button title="去支付" onPress={handlePay} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: {
    paddingHorizontal: PAD,
    paddingBottom: wp(104) + BOTTOM_SAFE_H,
    gap: wp(12),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    borderRadius: wp(22),
    padding: wp(14),
    marginBottom: wp(12),
    ...shadow(8, 20, 0.05, '#21426C', 5),
  },
  addressIconWrap: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF3FF',
  },
  addressTitle: {
    fontSize: fp(13),
    fontWeight: '800',
  },
  addressSub: {
    fontSize: fp(11),
    marginTop: wp(4),
    lineHeight: fp(16),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(22),
    padding: wp(14),
    ...shadow(8, 20, 0.05, '#21426C', 5),
  },
  thumb: {
    width: wp(74),
    height: wp(74),
    borderRadius: wp(18),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  info: { flex: 1 },
  name: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  variant: {
    fontSize: fp(12),
    marginTop: wp(6),
  },
  lineBottom: {
    marginTop: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: '#FF5A1F',
    fontSize: fp(18),
    fontWeight: '800',
  },
  qty: {
    fontSize: fp(12),
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: wp(22),
    padding: wp(16),
    marginTop: wp(2),
    ...shadow(8, 20, 0.05, '#21426C', 5),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: wp(12),
  },
  summaryRowLast: {
    marginBottom: 0,
    paddingTop: wp(6),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7EEF8',
  },
  summaryLabel: {
    fontSize: fp(12),
  },
  summaryValue: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  payLabel: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  payAmount: {
    color: '#FF5A1F',
    fontSize: fp(22),
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: PAD,
    paddingTop: wp(12),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  footerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: fp(11),
  },
  footerAmount: {
    color: '#FF5A1F',
    fontSize: fp(20),
    fontWeight: '800',
    marginTop: wp(2),
  },
});
