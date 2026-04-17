import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { MOCK_PROFILE_ORDERS } from '../../mock/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

const STATUS_COLORS = {
  待发货: '#f59e0b',
  已完成: '#22c55e',
  退款中: '#ef4444',
};

interface Props {
  onBack: () => void;
}

export const OrdersScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>我的订单</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <FlatList
        data={MOCK_PROFILE_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => (
          <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={$.topRow}>
              <Text style={[$.title, { color: colors.text }]}>{item.title}</Text>
              <View style={[$.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}18` }]}>
                <Text style={[$.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={[$.orderNo, { color: colors.textHint }]}>订单号：{item.id}</Text>
            <View style={$.bottomRow}>
              <Text style={[$.time, { color: colors.textHint }]}>{item.createdAt}</Text>
              <Text style={[$.amount, { color: colors.text }]}>¥ {item.amount.toFixed(2)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<StateView empty emptyText="暂无订单" />}
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    height: wp(52),
    borderBottomWidth: 1,
  },
  navButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(16),
    fontWeight: '700',
  },
  card: {
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(14),
    marginBottom: wp(12),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '700',
    marginRight: wp(10),
  },
  statusBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(10),
  },
  statusText: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  orderNo: {
    fontSize: fp(11),
    marginTop: wp(10),
  },
  bottomRow: {
    marginTop: wp(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: fp(11),
  },
  amount: {
    fontSize: fp(14),
    fontWeight: '700',
  },
});
