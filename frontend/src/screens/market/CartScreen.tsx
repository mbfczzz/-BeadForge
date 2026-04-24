import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, Button, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import type { RootScreenProps } from '../../navigation/types';
import { fp, wp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useCartStore } from '../../store/useCartStore';
import { useAddressStore } from '../../store/useAddressStore';

const PAD = wp(16);

export const CartScreen: React.FC<RootScreenProps<'Cart'>> = ({ navigation }) => {
  const { colors, dark } = useTheme();
  const items = useCartStore((state) => state.items);
  const defaultAddress = useAddressStore((state) => state.addresses.find((item) => item.isDefault) || state.addresses[0]);
  const updateQty = useCartStore((state) => state.updateQty);
  const toggleItem = useCartStore((state) => state.toggleItem);
  const toggleAll = useCartStore((state) => state.toggleAll);
  const removeItem = useCartStore((state) => state.removeItem);

  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);
  const totalPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [selectedItems],
  );
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('提示', '请先选择要结算的商品。');
      return;
    }

    if (!defaultAddress) {
      Alert.alert('提示', '请先在收货地址管理里设置默认地址。');
      return;
    }

    navigation.navigate('Payment', {
      source: 'cart',
      itemIds: selectedItems.map((item) => item.id),
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="购物车" onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
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
                  ? `默认地址 · ${defaultAddress.region} ${defaultAddress.detail}`
                  : '默认地址 · 请先去我的页面设置收货地址'}
              </Text>
              <Text style={[styles.addressSub, { color: colors.textSecondary }]}>
                {defaultAddress
                  ? `${defaultAddress.receiver} ${defaultAddress.phone} · 包邮 · 预计明天发货`
                  : '设置后结算时会自动带入默认地址'}
              </Text>
            </View>
            <Feather name="chevron-right" size={fp(16)} color={colors.textHint} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyWrap}>
            <StateView empty emptyText="购物车还是空的，去商城挑点材料吧。" />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => toggleItem(item.id)} style={styles.checkWrap}>
              <Feather
                name={item.selected ? 'check-circle' : 'circle'}
                size={fp(20)}
                color={item.selected ? colors.accent : colors.textHint}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('ProductDetail', { product: item.product })}
              style={[styles.thumb, { backgroundColor: `${item.product.color}14`, borderColor: colors.border }]}
            >
              <Feather name={item.product.icon as any} size={fp(24)} color={item.product.color} />
            </TouchableOpacity>

            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={[styles.variant, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.variant}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>¥ {item.product.price.toFixed(1)}</Text>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={() => updateQty(item.id, item.qty - 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: dark ? '#13233A' : '#F4F8FF' }]}
                  >
                    <Feather name="minus" size={fp(12)} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyNum, { color: colors.text }]}>{item.qty}</Text>
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={() => updateQty(item.id, item.qty + 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: dark ? '#13233A' : '#F4F8FF' }]}
                  >
                    <Feather name="plus" size={fp(12)} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.78} onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
              <Feather name="trash-2" size={fp(14)} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={[styles.footer, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleAll(!allSelected)} style={styles.footerCheck}>
          <Feather
            name={allSelected ? 'check-circle' : 'circle'}
            size={fp(20)}
            color={allSelected ? colors.accent : colors.textHint}
          />
          <Text style={[styles.footerCheckText, { color: colors.text }]}>全选</Text>
        </TouchableOpacity>

        <View style={styles.totalWrap}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>合计</Text>
          <Text style={styles.totalPrice}>¥ {totalPrice.toFixed(1)}</Text>
        </View>

        <Button title={`去结算${selectedItems.length ? ` (${selectedItems.length})` : ''}`} onPress={handleCheckout} />
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
  emptyWrap: {
    paddingTop: wp(120),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(22),
    padding: wp(14),
    ...shadow(8, 20, 0.05, '#21426C', 5),
  },
  checkWrap: {
    paddingRight: wp(10),
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
  info: {
    flex: 1,
  },
  name: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  variant: {
    fontSize: fp(12),
    marginTop: wp(6),
  },
  bottomRow: {
    marginTop: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(8),
  },
  price: {
    color: '#FF5A1F',
    fontSize: fp(18),
    fontWeight: '800',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: {
    minWidth: wp(28),
    textAlign: 'center',
    fontSize: fp(14),
    fontWeight: '700',
    marginHorizontal: wp(8),
  },
  deleteBtn: {
    paddingLeft: wp(10),
    alignSelf: 'flex-start',
    paddingTop: wp(4),
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
  footerCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  footerCheckText: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  totalWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: fp(11),
  },
  totalPrice: {
    color: '#FF5A1F',
    fontSize: fp(20),
    fontWeight: '800',
    marginTop: wp(2),
  },
});
