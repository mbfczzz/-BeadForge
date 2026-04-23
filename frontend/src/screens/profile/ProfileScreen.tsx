import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { FeedbackTicketItem } from '../../api/feedback';
import type {
  ProfileAddressItem,
  ProfileNoticeAction,
  ProfileNoticeItem,
  ProfileOrderFilterTab,
} from '../../api/profile';
import { MOCK_PROFILE_ADDRESSES, MOCK_PROFILE_FAVORITES, MOCK_PROFILE_NOTICES } from '../../mock/profile';
import { INITIAL_FEEDBACK_TICKETS } from '../../mock/feedback';
import { useTabBarVisibility } from '../../hooks/useTabBarVisibility';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddressStore } from '../../store/useAddressStore';
import { useNavigationUIStore } from '../../store/useNavigationUIStore';
import { useResourceAccessStore } from '../../store/useResourceAccessStore';
import { useTheme } from '../../theme';
import { AddressScreen } from './AddressScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { FeedbackDetailScreen } from './FeedbackDetailScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { FeedbackScreen } from './FeedbackScreen';
import { FollowListScreen } from './FollowListScreen';
import { LikedHistoryScreen } from './LikedHistoryScreen';
import { LikesScreen } from './LikesScreen';
import { LoginScreen } from './LoginScreen';
import { MyDesignsScreen } from './MyDesignsScreen';
import { MyFeedsScreen } from './MyFeedsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { OrderDetailScreen } from './OrderDetailScreen';
import { OrdersScreen } from './OrdersScreen';
import { PurchasedScreen } from './PurchasedScreen';
import { RegisterScreen } from './RegisterScreen';
import { SettingsScreen } from './SettingsScreen';
import { WalletScreen } from './WalletScreen';

type SubPage =
  | { key: 'none' }
  | { key: 'editProfile' }
  | { key: 'myDesigns' }
  | { key: 'favorites' }
  | { key: 'addresses' }
  | { key: 'likes' }
  | { key: 'likedHistory' }
  | { key: 'settings' }
  | { key: 'feedback' }
  | { key: 'feedbackDetail'; ticketId: string }
  | { key: 'myFeeds' }
  | { key: 'purchased' }
  | { key: 'followers' }
  | { key: 'following' }
  | { key: 'wallet' }
  | { key: 'notifications' }
  | { key: 'orders'; tab?: ProfileOrderFilterTab; returnTo?: 'root' | 'notifications' }
  | { key: 'orderDetail'; orderId: string; tab?: ProfileOrderFilterTab; returnTo?: 'orders' | 'notifications' };

type RootPageKey = Exclude<SubPage['key'], 'none' | 'orders' | 'orderDetail'>;

type MenuAction =
  | { type: 'page'; key: RootPageKey }
  | { type: 'orders'; tab?: ProfileOrderFilterTab }
  | { type: 'alert'; title: string; message: string };

function formatCompact(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${value}`;
}

function ShadowCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-[26px] border border-slate-100 bg-white ${className}`}
      style={{
        shadowColor: '#0f172a',
        shadowOpacity: 0.02,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, token, fetchStats } = useAuthStore();
  const setTabBarHidden = useNavigationUIStore((state) => state.setTabBarHidden);
  const pointsBalance = useResourceAccessStore((state) => state.pointsBalance);
  const signIn = useResourceAccessStore((state) => state.signIn);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>({ key: 'none' });
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<ProfileNoticeItem[]>(MOCK_PROFILE_NOTICES);
  const addresses = useAddressStore((state) => state.addresses);
  const createAddress = useAddressStore((state) => state.createAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const deleteAddress = useAddressStore((state) => state.deleteAddress);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicketItem[]>(INITIAL_FEEDBACK_TICKETS);
  const prevTokenRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (token) {
      void fetchStats();
    }
  }, [fetchStats, token]);

  useEffect(() => {
    if (prevTokenRef.current === token) {
      return;
    }

    setSubPage({ key: 'none' });
    setTabBarHidden(false);

    if (!token) {
      setAuthMode('login');
    }

    prevTokenRef.current = token;
  }, [token, setTabBarHidden]);

  useTabBarVisibility(subPage.key !== 'none');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchStats();
    } finally {
      setRefreshing(false);
    }
  }, [fetchStats]);

  const handleBackToRoot = useCallback(() => {
    setTabBarHidden(false);
    setSubPage({ key: 'none' });
  }, [setTabBarHidden]);

  const openPage = useCallback((page: RootPageKey) => {
    setSubPage({ key: page } as SubPage);
  }, []);

  const openFeedbackDetail = useCallback((ticketId: string) => {
    setSubPage({ key: 'feedbackDetail', ticketId });
  }, []);

  const openOrders = useCallback((tab?: ProfileOrderFilterTab, returnTo: 'root' | 'notifications' = 'root') => {
    setSubPage({ key: 'orders', tab, returnTo });
  }, []);

  const openOrderDetail = useCallback((
    orderId: string,
    tab?: ProfileOrderFilterTab,
    returnTo: 'orders' | 'notifications' = 'orders',
  ) => {
    setSubPage({ key: 'orderDetail', orderId, tab, returnTo });
  }, []);

  const markNoticeRead = useCallback((id: number) => {
    setNotices((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }, []);

  const markAllNoticesRead = useCallback(() => {
    setNotices((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const openNoticeAction = useCallback(
    (action?: ProfileNoticeAction) => {
      if (!action) {
        return;
      }

      if (action.type === 'orders') {
        openOrders(action.tab, 'notifications');
        return;
      }

      if (action.type === 'orderDetail') {
        openOrderDetail(action.orderId, action.tab, 'notifications');
        return;
      }

      if (action.type === 'likes') {
        openPage('likes');
        return;
      }

      if (action.type === 'wallet') {
        openPage('wallet');
        return;
      }

      if (action.type === 'settings') {
        openPage('settings');
      }
    },
    [openOrderDetail, openOrders, openPage],
  );

  const handleMenuAction = useCallback(
    (action: MenuAction) => {
      if (action.type === 'alert') {
        Alert.alert(action.title, action.message);
        return;
      }

      if (action.type === 'orders') {
        openOrders(action.tab, 'root');
        return;
      }

      openPage(action.key);
    },
    [openOrders, openPage],
  );

  const submitFeedbackTicket = useCallback((
    ticket: Omit<FeedbackTicketItem, 'id' | 'createdAt' | 'status' | 'replies'>,
  ) => {
    const createdAt = new Date().toLocaleString('zh-CN', { hour12: false });
    const ticketId = `TK${Date.now().toString().slice(-8)}`;

    const nextTicket: FeedbackTicketItem = {
      ...ticket,
      id: ticketId,
      createdAt,
      status: '处理中',
      replies: [
        {
          id: `${ticketId}-1`,
          from: '用户',
          content: ticket.content,
          createdAt,
        },
        {
          id: `${ticketId}-2`,
          from: '客服',
          content: '工单已收到，我们会尽快处理并回复你。',
          createdAt,
        },
      ],
    };

    setFeedbackTickets((current) => [nextTicket, ...current]);
    return ticketId;
  }, []);

  const displayName = user?.nickname || user?.username || 'BeadMori';
  const initial = displayName.slice(0, 1).toUpperCase();
  const unreadNoticeCount = notices.filter((item) => item.unread).length;

  const heroStats = [
    { label: '粉丝', value: '3.2k', action: { type: 'page', key: 'followers' } as const },
    { label: '关注', value: '186', action: { type: 'page', key: 'following' } as const },
    { label: '获赞', value: '12.8k', action: { type: 'page', key: 'likes' } as const },
    {
      label: '收藏',
      value: formatCompact(MOCK_PROFILE_FAVORITES.length * 1150),
      action: { type: 'page', key: 'favorites' } as const,
    },
  ];

  const orderItems: Array<{
    label: string;
    icon: keyof typeof Feather.glyphMap;
    count?: number;
    action: MenuAction;
  }> = [
    { label: '待支付', icon: 'credit-card', count: 1, action: { type: 'orders', tab: '待支付' } },
    { label: '待发货', icon: 'package', count: 1, action: { type: 'orders', tab: '待发货' } },
    { label: '待收货', icon: 'truck', count: 1, action: { type: 'orders', tab: '待收货' } },
    { label: '退款', icon: 'dollar-sign', action: { type: 'orders', tab: '退款/售后' } },
    { label: '售后', icon: 'rotate-ccw', action: { type: 'orders', tab: '退款/售后' } },
  ];

  const toolItems: Array<{
    label: string;
    icon: keyof typeof Feather.glyphMap;
    action: MenuAction;
  }> = [
    {
      label: '导出记录',
      icon: 'download',
      action: { type: 'alert', title: '导出记录', message: '导出记录功能开发中。' },
    },
    { label: '色号套装', icon: 'droplet', action: { type: 'page', key: 'purchased' } },
    { label: '我的点赞', icon: 'heart', action: { type: 'page', key: 'likes' } },
    { label: '我的收藏', icon: 'star', action: { type: 'page', key: 'favorites' } },
    { label: '浏览记录', icon: 'clock', action: { type: 'page', key: 'likedHistory' } },
    { label: '我的发布', icon: 'edit-3', action: { type: 'page', key: 'myFeeds' } },
    {
      label: '创作激励',
      icon: 'gift',
      action: { type: 'alert', title: '创作激励', message: '创作激励入口稍后开放。' },
    },
    { label: '我的豆仓', icon: 'box', action: { type: 'page', key: 'wallet' } },
  ];

  const bottomItems: Array<{
    label: string;
    icon: keyof typeof Feather.glyphMap;
    action: MenuAction;
  }> = [
    {
      label: '收货地址管理',
      icon: 'map-pin',
      action: { type: 'page', key: 'addresses' },
    },
    {
      label: '使用教程',
      icon: 'book-open',
      action: { type: 'alert', title: '使用教程', message: '教程中心正在整理内容。' },
    },
    {
      label: '意见反馈',
      icon: 'message-square',
      action: { type: 'page', key: 'feedback' },
    },
  ];

  if (!token) {
    return authMode === 'register' ? (
      <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />
    );
  }

  if (subPage.key === 'editProfile') {
    return <EditProfileScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'myDesigns') {
    return <MyDesignsScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'favorites') {
    return <FavoritesScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'addresses') {
    return (
      <AddressScreen
        onBack={handleBackToRoot}
        addresses={addresses}
        onCreate={createAddress}
        onUpdate={updateAddress}
        onDelete={deleteAddress}
        onSetDefault={setDefaultAddress}
      />
    );
  }
  if (subPage.key === 'likes') {
    return <LikesScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'likedHistory') {
    return <LikedHistoryScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'settings') {
    return <SettingsScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'feedback') {
    return (
      <FeedbackScreen
        onBack={handleBackToRoot}
        tickets={feedbackTickets}
        onSubmitTicket={submitFeedbackTicket}
        onOpenTicket={openFeedbackDetail}
      />
    );
  }
  if (subPage.key === 'feedbackDetail') {
    return (
      <FeedbackDetailScreen
        ticket={feedbackTickets.find((item) => item.id === subPage.ticketId)}
        onBack={() => setSubPage({ key: 'feedback' })}
      />
    );
  }
  if (subPage.key === 'myFeeds') {
    return <MyFeedsScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'purchased') {
    return <PurchasedScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'wallet') {
    return <WalletScreen onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'followers') {
    return <FollowListScreen type="followers" onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'following') {
    return <FollowListScreen type="following" onBack={handleBackToRoot} />;
  }
  if (subPage.key === 'notifications') {
    return (
      <NotificationsScreen
        notices={notices}
        onBack={handleBackToRoot}
        onReadNotice={markNoticeRead}
        onReadAll={markAllNoticesRead}
        onOpenAction={openNoticeAction}
      />
    );
  }
  if (subPage.key === 'orders') {
    return (
      <OrdersScreen
        onBack={() => {
          if (subPage.returnTo === 'notifications') {
            setSubPage({ key: 'notifications' });
            return;
          }
          handleBackToRoot();
        }}
        initialTab={subPage.tab}
        onOpenOrder={(orderId, tab) => openOrderDetail(orderId, tab, 'orders')}
      />
    );
  }
  if (subPage.key === 'orderDetail') {
    return (
      <OrderDetailScreen
        orderId={subPage.orderId}
        onBack={() => {
          if (subPage.returnTo === 'notifications') {
            setSubPage({ key: 'notifications' });
            return;
          }
          openOrders(subPage.tab, 'root');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 86 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <View className="mb-7 flex-row items-center justify-between">
          <Text className="text-[22px] font-extrabold tracking-tight text-slate-900">我的</Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => openPage('notifications')}
              className="relative h-10 w-10 items-center justify-center"
            >
              <Feather name="bell" size={22} color="#475569" />
              {unreadNoticeCount > 0 ? (
                <View className="absolute right-[4px] top-[4px] min-w-[16px] rounded-full bg-red-500 px-1.5 py-[1px]">
                  <Text className="text-center text-[9px] font-bold text-white">
                    {unreadNoticeCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable onPress={() => openPage('settings')} className="h-10 w-10 items-center justify-center">
              <Feather name="settings" size={22} color="#475569" />
            </Pressable>
          </View>
        </View>

        <View className="mb-6 flex-row items-center justify-between px-1">
          <View className="flex-1 flex-row items-center">
            <Pressable
              onPress={() => openPage('editProfile')}
              className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-blue-600"
              style={{
                shadowColor: '#2563EB',
                shadowOpacity: 0.16,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 5,
              }}
            >
              <Text className="text-[34px] font-bold text-white">{initial}</Text>
            </Pressable>

            <View className="flex-1">
              <Text className="text-[20px] font-extrabold text-slate-950">{displayName}</Text>
              <Pressable onPress={() => openPage('editProfile')} className="mt-1 flex-row items-center">
                <Text className="text-[12px] text-blue-500">点击编辑个性签名</Text>
                <Feather name="edit-2" size={12} color="#3B82F6" style={{ marginLeft: 4 }} />
              </Pressable>
            </View>
          </View>

          <View className="items-end">
            <Pressable onPress={() => openPage('wallet')} className="mb-3 flex-row items-center">
              <Feather name="award" size={14} color="#F59E0B" />
              <Text className="ml-1 text-[13px] font-bold text-amber-500">
                {pointsBalance.toLocaleString()}
              </Text>
            </Pressable>
            <Pressable
              onPress={signIn}
              className="flex-row items-center rounded-full bg-blue-600 px-4 py-2.5"
              style={{
                shadowColor: '#2563EB',
                shadowOpacity: 0.14,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <Feather name="calendar" size={13} color="#FFFFFF" />
              <Text className="ml-1.5 text-[12px] font-bold text-white">签到</Text>
            </Pressable>
          </View>
        </View>

        <ShadowCard className="mb-6 px-1 py-4">
          <View className="flex-row">
            {heroStats.map((item, index) => (
              <React.Fragment key={item.label}>
                <Pressable onPress={() => handleMenuAction(item.action)} className="flex-1 items-center py-1">
                  <Text className="text-[18px] font-extrabold text-slate-900">{item.value}</Text>
                  <Text className="mt-1 text-[11px] text-slate-400">{item.label}</Text>
                </Pressable>
                {index < heroStats.length - 1 ? <View className="w-px self-stretch bg-slate-100" /> : null}
              </React.Fragment>
            ))}
          </View>
        </ShadowCard>

        <ShadowCard className="mb-5 px-5 py-5">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-[15px] font-extrabold text-slate-900">我的订单</Text>
            <Pressable onPress={() => openOrders('全部')} className="flex-row items-center">
              <Text className="text-[12px] text-slate-400">查看全部</Text>
              <Feather name="chevron-right" size={14} color="#94A3B8" />
            </Pressable>
          </View>

          <View className="flex-row">
            {orderItems.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleMenuAction(item.action)}
                className="items-center"
                style={{ width: '20%' }}
              >
                <View className="relative mb-2 h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                  <Feather name={item.icon} size={19} color="#475569" />
                  {item.count ? (
                    <View className="absolute -right-1 -top-1 min-w-[18px] rounded-full border-2 border-white bg-red-500 px-1">
                      <Text className="text-center text-[10px] font-bold text-white">{item.count}</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-[11px] text-slate-600">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </ShadowCard>

        <ShadowCard className="mb-5 px-5 py-5">
          <Text className="mb-6 text-[15px] font-extrabold text-slate-900">创作工具</Text>
          <View className="flex-row flex-wrap">
            {toolItems.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => handleMenuAction(item.action)}
                className="items-center"
                style={{ width: '25%', marginBottom: index < 4 ? 28 : 4 }}
              >
                <Feather name={item.icon} size={23} color="#475569" />
                <Text className="mt-3 text-[11px] text-slate-700">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </ShadowCard>

        <ShadowCard className="overflow-hidden">
          {bottomItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => handleMenuAction(item.action)}
              className={`flex-row items-center justify-between px-5 py-5 ${index < bottomItems.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="flex-row items-center">
                <Feather name={item.icon} size={19} color="#64748B" />
                <Text className="ml-4 text-[14px] font-semibold text-slate-800">{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </Pressable>
          ))}
        </ShadowCard>
      </ScrollView>
    </SafeAreaView>
  );
};
