import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, StateView, SurfaceCard } from '../../components/common';
import { MOCK_PROFILE_ORDERS } from '../../mock/profile';
import { useTheme } from '../../theme';
import type { ProfileOrderFilterTab, ProfileOrderItem } from '../../api/profile';
import { fp, wp } from '../../utils/responsive';

const ORDER_TABS: ProfileOrderFilterTab[] = ['全部', '待支付', '待发货', '待收货', '退款/售后'];

const STATUS_COLORS: Record<ProfileOrderItem['status'], string> = {
  待支付: '#F59E0B',
  待发货: '#3B82F6',
  待收货: '#10B981',
  已完成: '#64748B',
  '退款/售后': '#EF4444',
};

interface Props {
  onBack: () => void;
  onOpenOrder: (orderId: string, tab?: ProfileOrderFilterTab) => void;
  initialTab?: ProfileOrderFilterTab;
}

export const OrdersScreen: React.FC<Props> = ({ onBack, onOpenOrder, initialTab = '全部' }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileOrderFilterTab>(initialTab);

  const filteredOrders = useMemo(() => {
    if (activeTab === '全部') return MOCK_PROFILE_ORDERS;
    return MOCK_PROFILE_ORDERS.filter((item) => item.status === activeTab);
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader title="我的订单" onBack={onBack} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
      >
        {ORDER_TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.82}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.86} onPress={() => onOpenOrder(item.id, activeTab)}>
            <SurfaceCard style={styles.card} bodyStyle={styles.cardBody}>
              <View style={styles.topRow}>
                <View style={styles.coverWrap}>
                  <Text style={styles.coverText}>{item.coverLabel || '订单'}</Text>
                </View>
                <View style={styles.infoWrap}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}15` }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.orderNo, { color: colors.textHint }]}>订单号：{item.id}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={[styles.time, { color: colors.textHint }]}>{item.createdAt}</Text>
                    <Text style={[styles.amount, { color: colors.text }]}>¥ {item.amount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<StateView empty emptyText={`暂无${activeTab === '全部' ? '' : activeTab}订单`} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    paddingTop: wp(8),
    paddingBottom: wp(12),
    paddingRight: wp(28),
  },
  tab: {
    height: wp(36),
    paddingHorizontal: wp(14),
    marginRight: wp(8),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tabText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: wp(16),
    paddingBottom: wp(40),
  },
  card: {
    marginBottom: wp(10),
  },
  cardBody: {
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverWrap: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(18),
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    color: '#3B82F6',
    fontSize: fp(11),
    fontWeight: '700',
  },
  infoWrap: {
    flex: 1,
    marginLeft: wp(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  title: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  orderNo: {
    fontSize: fp(11),
    marginTop: wp(8),
  },
  bottomRow: {
    marginTop: wp(10),
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
