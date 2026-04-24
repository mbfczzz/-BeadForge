import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, StateView, SurfaceCard } from '../../components/common';
import { MOCK_PROFILE_ORDERS } from '../../mock/profile';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  orderId: string;
  onBack: () => void;
}

const STATUS_COLORS = {
  待支付: '#F59E0B',
  待发货: '#3B82F6',
  待收货: '#10B981',
  已完成: '#64748B',
  '退款/售后': '#EF4444',
} as const;

export const OrderDetailScreen: React.FC<Props> = ({ orderId, onBack }) => {
  const { colors } = useTheme();
  const order = useMemo(
    () => MOCK_PROFILE_ORDERS.find((item) => item.id === orderId),
    [orderId],
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AppHeader title="订单详情" onBack={onBack} />
        <StateView empty emptyText="未找到对应订单" />
      </SafeAreaView>
    );
  }

  const steps = [
    { label: '提交订单', value: order.createdAt, active: true },
    { label: order.status, value: '当前状态', active: true },
    { label: '平台提醒', value: '如有疑问请联系售后', active: order.status === '退款/售后' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader title="订单详情" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SurfaceCard style={styles.card}>
          <View style={styles.headerRow}>
            <View style={[styles.coverWrap, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.coverText, { color: colors.accent }]}>{order.coverLabel || '订单'}</Text>
            </View>
            <View style={styles.infoWrap}>
              <Text style={[styles.title, { color: colors.text }]}>{order.title}</Text>
              <Text style={[styles.orderNo, { color: colors.textHint }]}>订单号：{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[order.status]}15` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>{order.status}</Text>
              </View>
            </View>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card} title="订单信息">
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textHint }]}>下单时间</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{order.createdAt}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textHint }]}>订单状态</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{order.status}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textHint }]}>订单金额</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>¥ {order.amount.toFixed(2)}</Text>
            </View>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card} title="进度跟踪">
          <View style={styles.timeline}>
            {steps.map((item, index) => (
              <View key={item.label} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: item.active ? colors.accent : colors.border }]} />
                  {index < steps.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} /> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.timelineValue, { color: colors.textHint }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(16),
    paddingBottom: wp(40),
    paddingTop: wp(8),
    gap: wp(10),
  },
  card: {
    marginBottom: wp(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
  },
  coverWrap: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  infoWrap: {
    flex: 1,
    marginLeft: wp(14),
  },
  title: {
    fontSize: fp(15),
    fontWeight: '700',
  },
  orderNo: {
    fontSize: fp(11),
    marginTop: wp(6),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: wp(8),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  infoList: {
    gap: wp(12),
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fp(12),
  },
  infoValue: {
    fontSize: fp(13),
    fontWeight: '600',
  },
  timeline: {
    gap: wp(6),
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: wp(18),
    alignItems: 'center',
  },
  timelineDot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginTop: wp(4),
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: wp(4),
  },
  timelineContent: {
    flex: 1,
    paddingBottom: wp(14),
    marginLeft: wp(10),
  },
  timelineLabel: {
    fontSize: fp(13),
    fontWeight: '600',
  },
  timelineValue: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
});
