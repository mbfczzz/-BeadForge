import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/common';
import { useTheme } from '../../theme';
import type { ProfileOrderFilterTab } from '../../api/profile';
import {
  PROFILE_ORDERS,
  PROFILE_ORDER_STATUS_META,
  PROFILE_ORDER_TABS,
  getProfileOrderActions,
  toProfileOrderTab,
  type OrderActionItem,
  type OrderFilterTab,
  type ProfileDisplayOrder,
} from '../../mock/profileOrders';
import { fp, wp } from '../../utils/responsive';

type SortMode = 'latest' | 'amount';
type OrderListItem =
  | { type: 'skeleton'; id: string }
  | { type: 'order'; order: ProfileDisplayOrder };

const SKELETON_ITEMS: OrderListItem[] = Array.from({ length: 4 }, (_, index) => ({
  type: 'skeleton',
  id: `skeleton-${index}`,
}));

const JD_RED = '#F2270C';
const JD_ORANGE = '#FF8A00';
const JD_BLUE = '#2F6BFF';
const JD_SOFT_RED = '#FFF2EA';
const JD_SOFT_ORANGE = '#FFF7E8';

function formatAmount(value: number) {
  return `￥${value.toFixed(2)}`;
}

function getOrderAccent(status: ProfileDisplayOrder['status']) {
  if (status === '待支付') {
    return JD_ORANGE;
  }

  if (status === '待发货') {
    return JD_BLUE;
  }

  return PROFILE_ORDER_STATUS_META[status].color;
}

function OrderTabBar({
  activeTab,
  counts,
  colors,
  onChange,
}: {
  activeTab: OrderFilterTab;
  counts: Record<OrderFilterTab, number>;
  colors: ReturnType<typeof useTheme>['colors'];
  onChange: (tab: OrderFilterTab) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsRow}
      style={styles.tabsScroll}
    >
      {PROFILE_ORDER_TABS.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tabChip,
              {
                backgroundColor: active ? JD_RED : colors.surface,
                borderColor: active ? JD_RED : colors.border,
              },
            ]}
          >
            <Text style={[styles.tabLabel, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.tabCountWrap,
                { backgroundColor: active ? 'rgba(255,255,255,0.2)' : JD_SOFT_RED },
              ]}
            >
              <Text style={[styles.tabCountText, { color: active ? '#FFFFFF' : JD_RED }]}>
                {counts[tab.key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function EmptyState({
  activeTab,
  keyword,
  colors,
  onReset,
}: {
  activeTab: OrderFilterTab;
  keyword: string;
  colors: ReturnType<typeof useTheme>['colors'];
  onReset: () => void;
}) {
  const tabLabel = activeTab === '全部' ? '订单' : `${activeTab}订单`;

  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
        <Feather name="inbox" size={fp(18)} color={colors.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>暂无匹配订单</Text>
      <Text style={[styles.emptyText, { color: colors.textHint }]}>
        {keyword ? `没有找到与“${keyword}”相关的${tabLabel}` : `${tabLabel}会展示在这里`}
      </Text>
      <Pressable onPress={onReset} style={[styles.emptyButton, { backgroundColor: colors.accent }]}>
        <Text style={styles.emptyButtonText}>重置筛选</Text>
      </Pressable>
    </View>
  );
}

function OrderSkeletonCard({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <View style={[styles.skeletonLine, { width: wp(112), backgroundColor: colors.skeleton }]} />
        <View style={[styles.skeletonLine, { width: wp(62), backgroundColor: colors.skeleton }]} />
      </View>
      <View style={styles.productRow}>
        <View style={[styles.thumbSkeleton, { backgroundColor: colors.skeleton }]} />
        <View style={styles.productMain}>
          <View style={[styles.skeletonLine, { width: '68%', backgroundColor: colors.skeleton }]} />
          <View
            style={[
              styles.skeletonLine,
              { width: '84%', marginTop: wp(10), backgroundColor: colors.skeleton },
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              { width: '54%', marginTop: wp(8), backgroundColor: colors.skeleton },
            ]}
          />
        </View>
      </View>
      <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />
      <View style={styles.cardBottomRow}>
        <View>
          <View style={[styles.skeletonLine, { width: wp(54), backgroundColor: colors.skeleton }]} />
          <View
            style={[
              styles.skeletonLine,
              { width: wp(88), height: wp(16), marginTop: wp(10), backgroundColor: colors.skeleton },
            ]}
          />
        </View>
        <View style={styles.actionRow}>
          <View style={[styles.skeletonButton, { backgroundColor: colors.skeleton }]} />
          <View style={[styles.skeletonButton, { backgroundColor: colors.skeleton }]} />
        </View>
      </View>
    </View>
  );
}

function OrderCard({
  colors,
  item,
  onOpen,
  onActionPress,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  item: ProfileDisplayOrder;
  onOpen: (order: ProfileDisplayOrder) => void;
  onActionPress: (order: ProfileDisplayOrder, action: OrderActionItem) => void;
}) {
  const meta = PROFILE_ORDER_STATUS_META[item.status];
  const actions = getProfileOrderActions(item.status);
  const accent = getOrderAccent(item.status);
  const priceColor = item.status === '已完成' ? colors.text : JD_RED;

  return (
    <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Feather name="shopping-bag" size={fp(13)} color={colors.textSecondary} />
          <Text style={[styles.orderHeaderText, { color: colors.textSecondary }]} numberOfLines={1}>
            订单号 {item.orderNo}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === '待支付' ? JD_SOFT_ORANGE : meta.soft,
              borderColor: item.status === '待支付' ? '#FFD6A4' : meta.border,
            },
          ]}
        >
          <Feather name={meta.icon} size={fp(11)} color={accent} />
          <Text style={[styles.statusBadgeText, { color: accent }]}>{item.status}</Text>
        </View>
      </View>

      <Pressable onPress={() => onOpen(item)} style={styles.orderTopPressable}>
        <View style={styles.productRow}>
          <View
            style={[
              styles.thumbWrap,
              {
                backgroundColor: item.status === '待支付' ? JD_SOFT_RED : colors.accentLight,
                borderColor: item.status === '待支付' ? '#FFE0D2' : colors.border,
              },
            ]}
          >
            <Text style={[styles.thumbText, { color: colors.accent }]}>{item.imageText}</Text>
          </View>

          <View style={styles.productMain}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            <View style={styles.metaLine}>
              <Text
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: item.status === '待支付' ? JD_SOFT_RED : colors.inputBg,
                    color: item.status === '待支付' ? JD_RED : colors.accent,
                  },
                ]}
              >
                {item.category}
              </Text>
              <Text style={[styles.itemCountText, { color: colors.textHint }]}>共 {item.itemCount} 件</Text>
            </View>

            <Text style={[styles.metaText, { color: colors.textHint }]} numberOfLines={1}>
              下单时间 {item.createdAt}
            </Text>
          </View>
        </View>
      </Pressable>

      <View
        style={[
          styles.statusNote,
          {
            backgroundColor: item.status === '待支付' ? JD_SOFT_RED : colors.inputBg,
            borderColor: item.status === '待支付' ? '#FFE0D2' : colors.border,
          },
        ]}
      >
        <Text style={[styles.statusNoteText, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.statusNote}
        </Text>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.amountBlock}>
          <Text style={[styles.amountLabel, { color: colors.textHint }]}>实付款</Text>
          <Text style={[styles.amountValue, { color: priceColor }]}>{formatAmount(item.amount)}</Text>
        </View>

        <View style={styles.actionRow}>
          {actions.map((action) => {
            const primary = action.variant === 'primary';

            return (
              <Pressable
                key={action.key}
                onPress={() => onActionPress(item, action)}
                style={[
                  styles.actionButton,
                  primary
                    ? { backgroundColor: item.status === '待支付' ? JD_ORANGE : accent, borderColor: item.status === '待支付' ? JD_ORANGE : accent }
                    : { backgroundColor: colors.surface, borderColor: item.status === '待支付' ? '#F4C7A3' : colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: primary ? '#FFFFFF' : item.status === '待支付' ? '#7A3810' : colors.text },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface Props {
  onBack: () => void;
  onOpenOrder: (orderId: string, tab?: ProfileOrderFilterTab) => void;
  initialTab?: ProfileOrderFilterTab;
}

export const OrdersScreen: React.FC<Props> = ({ onBack, onOpenOrder, initialTab = '全部' }) => {
  const { colors, dark } = useTheme();
  const [activeTab, setActiveTab] = useState<OrderFilterTab>(initialTab);
  const [keyword, setKeyword] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const counts = useMemo<Record<OrderFilterTab, number>>(() => {
    const next: Record<OrderFilterTab, number> = {
      全部: PROFILE_ORDERS.length,
      待支付: 0,
      待发货: 0,
      待收货: 0,
      '退款/售后': 0,
      已完成: 0,
    };

    PROFILE_ORDERS.forEach((item) => {
      next[item.status as Exclude<OrderFilterTab, '全部'>] += 1;
    });

    return next;
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    let next = PROFILE_ORDERS.filter((item) => {
      const tabMatched = activeTab === '全部' ? true : item.status === activeTab;
      const keywordMatched =
        normalizedKeyword.length === 0
          ? true
          : `${item.title} ${item.orderNo} ${item.category}`.toLowerCase().includes(normalizedKeyword);

      return tabMatched && keywordMatched;
    });

    next = [...next].sort((left, right) => {
      if (sortMode === 'amount') {
        return right.amount - left.amount;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });

    return next;
  }, [activeTab, keyword, sortMode]);

  const listData = useMemo<OrderListItem[]>(
    () => (loading ? SKELETON_ITEMS : filteredOrders.map((order) => ({ type: 'order', order }))),
    [filteredOrders, loading],
  );

  const openOrder = useCallback(
    (order: ProfileDisplayOrder) => {
      onOpenOrder(order.id, toProfileOrderTab(order.status));
    },
    [onOpenOrder],
  );

  const handleActionPress = useCallback(
    (order: ProfileDisplayOrder, action: OrderActionItem) => {
      console.log('order-action', order.id, action.key);
      onOpenOrder(order.id, toProfileOrderTab(order.status));
    },
    [onOpenOrder],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 850);
  }, []);

  const handleReset = useCallback(() => {
    setKeyword('');
    setSortMode('latest');
    setActiveTab('全部');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OrderListItem }) => {
      if (item.type === 'skeleton') {
        return <OrderSkeletonCard colors={colors} />;
      }

      return (
        <OrderCard
          colors={colors}
          item={item.order}
          onOpen={openOrder}
          onActionPress={handleActionPress}
        />
      );
    },
    [colors, handleActionPress, openOrder],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <FlatList
        data={listData}
        keyExtractor={(item) => (item.type === 'skeleton' ? item.id : item.order.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={JD_RED}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <AppHeader
              title="我的订单"
              onBack={onBack}
              right={
                <View style={[styles.countPill, { backgroundColor: JD_SOFT_RED }]}>
                  <Text style={[styles.countPillText, { color: JD_RED }]}>{counts.全部} 单</Text>
                </View>
              }
            />

            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: dark ? '#020617' : '#1E3A8A',
                  },
                ]}
              >
                <Feather name="search" size={fp(14)} color={colors.textHint} />
                <TextInput
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder="搜索订单号、商品名称"
                  placeholderTextColor={colors.textHint}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {keyword ? (
                  <Pressable onPress={() => setKeyword('')} style={[styles.clearChip, { backgroundColor: colors.inputBg }]}>
                    <Feather name="x" size={fp(12)} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>

              <Pressable
                onPress={() => setSortMode((current) => (current === 'latest' ? 'amount' : 'latest'))}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: dark ? '#020617' : '#1E3A8A',
                  },
                ]}
              >
                <Feather name="sliders" size={fp(14)} color={colors.textSecondary} />
                <Text style={[styles.sortChipText, { color: colors.text }]}>
                  {sortMode === 'latest' ? '最近下单' : '金额优先'}
                </Text>
              </Pressable>
            </View>

            <OrderTabBar
              activeTab={activeTab}
              counts={counts}
              colors={colors}
              onChange={setActiveTab}
            />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {activeTab === '全部' ? '全部订单' : activeTab}
              </Text>
              <Text style={[styles.summaryText, { color: colors.textHint }]}>
                {filteredOrders.length} 条结果 · {sortMode === 'latest' ? '按最近下单排序' : '按金额从高到低'}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={JD_RED} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>正在整理订单...</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState activeTab={activeTab} keyword={keyword} colors={colors} onReset={handleReset} />
          ) : null
        }
        ListFooterComponent={<View style={styles.footerSpace} />}
        contentContainerStyle={[
          styles.listContent,
          !loading && filteredOrders.length === 0 ? styles.listContentEmpty : null,
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingBottom: wp(28),
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: wp(4),
    paddingBottom: wp(10),
  },
  countPill: {
    minWidth: wp(58),
    height: wp(28),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(10),
  },
  countPillText: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: wp(10),
    paddingHorizontal: wp(16),
    paddingTop: wp(8),
  },
  searchBox: {
    flex: 1,
    minHeight: wp(48),
    borderRadius: wp(18),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(8),
    fontSize: fp(13),
    paddingVertical: wp(10),
  },
  clearChip: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortChip: {
    minWidth: wp(96),
    height: wp(48),
    borderRadius: wp(18),
    borderWidth: 1,
    paddingHorizontal: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  sortChipText: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  tabsScroll: {
    flexGrow: 0,
    marginTop: wp(14),
  },
  tabsRow: {
    paddingHorizontal: wp(16),
    paddingRight: wp(26),
    gap: wp(10),
  },
  tabChip: {
    minHeight: wp(42),
    borderRadius: wp(16),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  tabLabel: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  tabCountWrap: {
    minWidth: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  tabCountText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  summaryRow: {
    paddingHorizontal: wp(16),
    marginTop: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  summaryTitle: {
    fontSize: fp(14),
    fontWeight: '800',
  },
  summaryText: {
    flex: 1,
    textAlign: 'right',
    fontSize: fp(11),
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(16),
    marginTop: wp(10),
  },
  loadingText: {
    fontSize: fp(11),
  },
  orderCard: {
    marginHorizontal: wp(6),
    marginTop: wp(8),
    borderRadius: wp(14),
    borderWidth: 1,
    paddingHorizontal: wp(12),
    paddingTop: wp(10),
    paddingBottom: wp(11),
    shadowColor: '#B42318',
    shadowOpacity: 0.025,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  orderHeader: {
    minHeight: wp(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
    marginBottom: wp(7),
  },
  orderHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  orderHeaderText: {
    flex: 1,
    fontSize: fp(10),
    fontWeight: '700',
  },
  orderTopPressable: {
    borderRadius: wp(12),
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbWrap: {
    width: wp(62),
    height: wp(62),
    borderRadius: wp(13),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(10),
  },
  thumbText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
  thumbSkeleton: {
    width: wp(62),
    height: wp(62),
    borderRadius: wp(13),
    marginRight: wp(10),
  },
  productMain: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    minHeight: wp(34),
  },
  cardTitle: {
    fontSize: fp(13),
    fontWeight: '800',
    lineHeight: fp(18),
  },
  statusBadge: {
    minHeight: wp(22),
    borderRadius: wp(11),
    borderWidth: 1,
    paddingHorizontal: wp(7),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  statusBadgeText: {
    fontSize: fp(9),
    fontWeight: '800',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp(6),
    marginTop: wp(5),
    marginBottom: wp(3),
  },
  categoryBadge: {
    fontSize: fp(9),
    fontWeight: '700',
    paddingHorizontal: wp(7),
    paddingVertical: wp(3),
    borderRadius: wp(999),
    overflow: 'hidden',
  },
  metaText: {
    fontSize: fp(10),
    lineHeight: fp(14),
  },
  itemCountText: {
    fontSize: fp(10),
    lineHeight: fp(14),
  },
  statusNote: {
    minHeight: wp(28),
    borderRadius: wp(9),
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    marginTop: wp(9),
    marginBottom: wp(9),
  },
  statusNoteText: {
    fontSize: fp(10),
    lineHeight: fp(14),
  },
  cardDivider: {
    height: 1,
    marginVertical: wp(14),
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(8),
  },
  amountBlock: {
    minWidth: wp(84),
  },
  amountLabel: {
    fontSize: fp(9),
    marginBottom: wp(2),
  },
  amountValue: {
    fontSize: fp(18),
    fontWeight: '900',
  },
  actionRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: wp(6),
  },
  actionButton: {
    minWidth: wp(76),
    height: wp(31),
    borderRadius: wp(15),
    borderWidth: 1,
    paddingHorizontal: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(28),
    paddingTop: wp(40),
  },
  emptyIcon: {
    width: wp(68),
    height: wp(68),
    borderRadius: wp(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(16),
  },
  emptyTitle: {
    fontSize: fp(16),
    fontWeight: '800',
    marginBottom: wp(8),
  },
  emptyText: {
    fontSize: fp(12),
    lineHeight: fp(18),
    textAlign: 'center',
    marginBottom: wp(16),
  },
  emptyButton: {
    minWidth: wp(96),
    height: wp(40),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(16),
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fp(12),
    fontWeight: '700',
  },
  skeletonLine: {
    height: wp(11),
    borderRadius: wp(8),
  },
  skeletonButton: {
    width: wp(76),
    height: wp(31),
    borderRadius: wp(15),
  },
  footerSpace: {
    height: wp(18),
  },
});
