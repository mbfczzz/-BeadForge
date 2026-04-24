import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, StateView, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import {
  PROFILE_ORDERS,
  PROFILE_ORDER_STATUS_META,
  buildProfileOrderTimeline,
  getProfileOrderActions,
  resolveProfileTrackingNo,
} from '../../mock/profileOrders';
import { fp, wp } from '../../utils/responsive';

function InfoRow({
  colors,
  label,
  value,
  multiline,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={[styles.infoRow, multiline ? styles.infoRowTop : null]}>
      <Text style={[styles.infoLabel, { color: colors.textHint }]}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          { color: colors.text },
          multiline ? styles.infoValueMultiline : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

interface Props {
  orderId: string;
  onBack: () => void;
}

export const OrderDetailScreen: React.FC<Props> = ({ orderId, onBack }) => {
  const { colors, dark } = useTheme();

  const order = useMemo(
    () => PROFILE_ORDERS.find((item) => item.id === orderId) || null,
    [orderId],
  );

  const handleActionPress = useCallback((actionKey: string) => {
    console.log('order-detail-action', orderId, actionKey);
  }, [orderId]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="订单详情" onBack={onBack} />
        <StateView empty emptyText="未找到对应订单" />
      </SafeAreaView>
    );
  }

  const statusMeta = PROFILE_ORDER_STATUS_META[order.status];
  const actions = getProfileOrderActions(order.status);
  const timeline = buildProfileOrderTimeline(order);
  const trackingNo = resolveProfileTrackingNo(order);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="订单详情" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SurfaceCard style={styles.card} bodyStyle={styles.heroBody}>
          <View style={styles.heroTopRow}>
            <View style={[styles.thumbWrap, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.thumbText, { color: colors.accent }]}>{order.imageText}</Text>
            </View>

            <View style={styles.heroMain}>
              <View style={[styles.statusBadge, { backgroundColor: statusMeta.soft, borderColor: statusMeta.border }]}>
                <Feather name={statusMeta.icon} size={fp(11)} color={statusMeta.color} />
                <Text style={[styles.statusText, { color: statusMeta.color }]}>{order.status}</Text>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{order.title}</Text>
              <Text style={[styles.orderNo, { color: colors.textHint }]}>订单号 {order.orderNo}</Text>

              <View style={styles.metaTags}>
                <View style={[styles.metaChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.metaChipText, { color: colors.accent }]}>{order.category}</Text>
                </View>
                <View style={[styles.metaChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>共 {order.itemCount} 件</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.notePanel, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="info" size={fp(13)} color={statusMeta.color} />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>{order.statusNote}</Text>
          </View>

          <View
            style={[
              styles.amountPanel,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? '#020617' : '#1E3A8A',
              },
            ]}
          >
            <View>
              <Text style={[styles.amountLabel, { color: colors.textHint }]}>支付金额</Text>
              <Text style={[styles.amountValue, { color: statusMeta.color }]}>{`￥${order.amount.toFixed(2)}`}</Text>
            </View>
            <View style={styles.amountMeta}>
              <Text style={[styles.amountMetaText, { color: colors.textHint }]}>{order.createdAt}</Text>
            </View>
          </View>

          <View style={styles.actionsWrap}>
            {actions.map((action) => {
              const primary = action.variant === 'primary';

              return (
                <Pressable
                  key={action.key}
                  onPress={() => handleActionPress(action.key)}
                  style={[
                    styles.actionButton,
                    primary
                      ? { backgroundColor: statusMeta.color, borderColor: statusMeta.color }
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.actionButtonText, { color: primary ? '#FFFFFF' : colors.text }]}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card} title="订单信息">
          <InfoRow colors={colors} label="订单号" value={order.orderNo} />
          <InfoRow colors={colors} label="下单时间" value={order.createdAt} />
          <InfoRow colors={colors} label="商品分类" value={order.category} />
          <InfoRow colors={colors} label="商品数量" value={`${order.itemCount} 件`} />
          <InfoRow colors={colors} label="订单状态" value={order.status} />
        </SurfaceCard>

        <SurfaceCard
          style={styles.card}
          title={order.status === '退款/售后' ? '售后信息' : '收货与物流'}
        >
          <InfoRow colors={colors} label="收货人" value={order.receiver} />
          <InfoRow colors={colors} label="联系电话" value={order.phone} />
          <InfoRow
            colors={colors}
            label={order.status === '退款/售后' ? '售后单号' : '物流单号'}
            value={trackingNo}
          />
          <InfoRow colors={colors} label="收货地址" value={order.address} multiline />
        </SurfaceCard>

        <SurfaceCard style={styles.card} title="进度追踪">
          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <View key={`${item.label}-${index}`} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: item.active ? statusMeta.color : colors.border },
                    ]}
                  />
                  {index < timeline.length - 1 ? (
                    <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />
                  ) : null}
                </View>
                <View style={styles.timelineMain}>
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
    paddingTop: wp(8),
    paddingBottom: wp(28),
  },
  card: {
    marginBottom: wp(12),
  },
  heroBody: {
    gap: wp(14),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbWrap: {
    width: wp(76),
    height: wp(76),
    borderRadius: wp(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(14),
  },
  thumbText: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  heroMain: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    minHeight: wp(28),
    borderRadius: wp(14),
    borderWidth: 1,
    paddingHorizontal: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: wp(10),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  title: {
    fontSize: fp(16),
    fontWeight: '800',
    lineHeight: fp(22),
  },
  orderNo: {
    fontSize: fp(11),
    marginTop: wp(6),
  },
  metaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    marginTop: wp(10),
  },
  metaChip: {
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
  },
  metaChipText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  notePanel: {
    minHeight: wp(44),
    borderRadius: wp(16),
    borderWidth: 1,
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(8),
  },
  noteText: {
    flex: 1,
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  amountPanel: {
    borderRadius: wp(18),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  amountLabel: {
    fontSize: fp(10),
    marginBottom: wp(6),
  },
  amountValue: {
    fontSize: fp(22),
    fontWeight: '800',
  },
  amountMeta: {
    alignItems: 'flex-end',
  },
  amountMetaText: {
    fontSize: fp(11),
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
  },
  actionButton: {
    minWidth: wp(96),
    height: wp(40),
    borderRadius: wp(14),
    borderWidth: 1,
    paddingHorizontal: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fp(12),
    fontWeight: '800',
  },
  infoRow: {
    minHeight: wp(38),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  infoRowTop: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: fp(12),
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: fp(12),
    fontWeight: '600',
  },
  infoValueMultiline: {
    textAlign: 'left',
    lineHeight: fp(18),
  },
  timeline: {
    paddingTop: wp(2),
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineRail: {
    width: wp(20),
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
    marginTop: wp(5),
  },
  timelineMain: {
    flex: 1,
    paddingBottom: wp(16),
    marginLeft: wp(10),
  },
  timelineLabel: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  timelineValue: {
    fontSize: fp(11),
    lineHeight: fp(17),
    marginTop: wp(4),
  },
});
