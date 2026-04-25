import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { feedbackApi, type FeedbackTicketItem } from '../../api/feedback';
import type { UserInfo } from '../../api/auth';
import { profileApi, type ProfileNoticeAction, type ProfileNoticeItem, type ProfileOrderFilterTab } from '../../api/profile';
import { notificationApi } from '../../api/notification';
import type { UserStats } from '../../api/user';
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

type MineActionKey =
  | 'editProfile'
  | 'followers'
  | 'following'
  | 'likes'
  | 'favorites'
  | 'myDesigns'
  | 'myFeeds'
  | 'likedHistory'
  | 'purchased'
  | 'wallet'
  | 'notifications'
  | 'settings'
  | 'addresses'
  | 'feedback'
  | 'orders'
  | 'tutorial';

type RootPageKey = Exclude<MineActionKey, 'tutorial' | 'orders'>;

type SubPage =
  | { key: 'none' }
  | { key: RootPageKey }
  | { key: 'feedbackDetail'; ticketId: string }
  | { key: 'orders'; tab?: ProfileOrderFilterTab; returnTo?: 'root' | 'notifications' }
  | { key: 'orderDetail'; orderId: string; tab?: ProfileOrderFilterTab; returnTo?: 'orders' | 'notifications' };

interface MineStatItem {
  id: string;
  label: string;
  value: string;
  actionKey: MineActionKey;
}

interface MineToolItem {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  iconTint: string;
  iconBackground: string;
  actionKey: MineActionKey;
  badgeCount?: number;
}

interface MineOrderShortcut {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  pendingCount: number;
  tint: string;
  bg: string;
  actionKey: 'orders';
  orderTab?: ProfileOrderFilterTab;
}

interface MineMenuItem {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  actionKey: MineActionKey;
}

interface MineProfileSummary {
  displayName: string;
  avatarText: string;
  signature: string;
  levelLabel: string;
  pointsValue: string;
  gender?: string | null;
}

const MINE_PAGE_TITLE = '我的';

const MINE_TOOL_ITEMS: MineToolItem[] = [
  {
    id: 'designs',
    label: '我的作品',
    icon: 'grid',
    iconTint: '#2563EB',
    iconBackground: '#E0ECFF',
    actionKey: 'myDesigns',
  },
  {
    id: 'posts',
    label: '我的发布',
    icon: 'radio',
    iconTint: '#0F9E8A',
    iconBackground: '#DBF6F1',
    actionKey: 'myFeeds',
  },
  {
    id: 'likes',
    label: '我的点赞',
    icon: 'heart',
    iconTint: '#E5486D',
    iconBackground: '#FFE4EB',
    actionKey: 'likes',
  },
  {
    id: 'favorites',
    label: '我的收藏',
    icon: 'star',
    iconTint: '#F59E0B',
    iconBackground: '#FFF1CF',
    actionKey: 'favorites',
  },
  {
    id: 'history',
    label: '浏览记录',
    icon: 'clock',
    iconTint: '#6366F1',
    iconBackground: '#E6E8FF',
    actionKey: 'likedHistory',
  },
  {
    id: 'orders',
    label: '已购资源',
    icon: 'shopping-bag',
    iconTint: '#7C3AED',
    iconBackground: '#EFE3FF',
    actionKey: 'purchased',
  },
  {
    id: 'wallet',
    label: '积分钱包',
    icon: 'award',
    iconTint: '#0EA5E9',
    iconBackground: '#DFF5FF',
    actionKey: 'wallet',
  },
  {
    id: 'notices',
    label: '通知中心',
    icon: 'bell',
    iconTint: '#334155',
    iconBackground: '#E7EDF7',
    actionKey: 'notifications',
    badgeCount: 3,
  },
];

const MINE_ORDER_SHORTCUTS: MineOrderShortcut[] = [
  { id: 'pending-payment', label: '待付款', icon: 'credit-card', pendingCount: 1, tint: '#F97316', bg: '#FFF1E7', actionKey: 'orders' },
  { id: 'pending-shipping', label: '待发货', icon: 'package', pendingCount: 2, tint: '#8B5CF6', bg: '#F3ECFF', actionKey: 'orders' },
  { id: 'pending-receipt', label: '待收货', icon: 'truck', pendingCount: 1, tint: '#0EA5E9', bg: '#E8F7FF', actionKey: 'orders' },
  { id: 'completed', label: '已完成', icon: 'check-circle', pendingCount: 6, tint: '#22C55E', bg: '#EAFBF1', actionKey: 'orders' },
  { id: 'after-sale', label: '售后', icon: 'rotate-ccw', pendingCount: 0, tint: '#64748B', bg: '#EEF2F7', actionKey: 'orders' },
];

const MINE_MENU_ITEMS: MineMenuItem[] = [
  {
    id: 'addresses',
    label: '收货地址管理',
    description: '管理常用地址、默认收件人与联系电话',
    icon: 'map-pin',
    actionKey: 'addresses',
  },
  {
    id: 'tutorial',
    label: '使用教程',
    description: '查看新手指南、制作流程与功能操作说明',
    icon: 'book-open',
    actionKey: 'tutorial',
  },
  {
    id: 'feedback',
    label: '帮助与反馈',
    description: '提交问题、查看工单进度或联系支持团队',
    icon: 'help-circle',
    actionKey: 'feedback',
  },
];

function formatCount(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${value}`;
}

function buildMineProfileSummary(
  user: UserInfo | null,
  stats: UserStats,
  pointsBalance: number,
): MineProfileSummary {
  const displayName = user?.nickname?.trim() || user?.username?.trim() || 'BeadMori';

  return {
    displayName,
    avatarText: displayName.slice(0, 1).toUpperCase(),
    signature: user?.bio?.trim() || '记录手作灵感、拼豆配色和每一次认真完成的小作品。',
    levelLabel: `Lv.${Math.max(3, stats.designCount + 2)} 创作者`,
    pointsValue: formatCount(pointsBalance),
    gender: user?.gender,
  };
}

function getGenderBadgeMeta(gender?: string | null) {
  const normalized = (gender || '').trim().toLowerCase();

  if (normalized.includes('男') || normalized === 'male') {
    return { icon: 'gender-male', color: '#2563EB', bg: '#EAF2FF' };
  }

  if (normalized.includes('女') || normalized === 'female') {
    return { icon: 'gender-female', color: '#EC4899', bg: '#FFEAF3' };
  }

  return { icon: 'gender-male-female', color: '#64748B', bg: '#EEF4FF' };
}

function buildMineStatItems(stats: UserStats, favoritesCount: number): MineStatItem[] {
  return [
    { id: 'followers', label: '粉丝', value: formatCount(stats.followerCount), actionKey: 'followers' },
    { id: 'following', label: '关注', value: formatCount(stats.followingCount), actionKey: 'following' },
    { id: 'likes', label: '获赞', value: formatCount(stats.likeCount), actionKey: 'likes' },
    { id: 'favorites', label: '收藏', value: formatCount(favoritesCount), actionKey: 'favorites' },
  ];
}

export const ProfileScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { user, token, stats, fetchStats } = useAuthStore();
  const setTabBarHidden = useNavigationUIStore((state) => state.setTabBarHidden);
  const pointsBalance = useResourceAccessStore((state) => state.pointsBalance);
  const signIn = useResourceAccessStore((state) => state.signIn);
  const lastSignInDate = useResourceAccessStore((state) => state.lastSignInDate);
  const addresses = useAddressStore((state) => state.addresses);
  const createAddress = useAddressStore((state) => state.createAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const deleteAddress = useAddressStore((state) => state.deleteAddress);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>({ key: 'none' });
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<ProfileNoticeItem[]>([]);
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicketItem[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const prevTokenRef = useRef<string | null | undefined>(undefined);

  const loadWallet = useResourceAccessStore((state) => state.loadWallet);
  const loadAddresses = useAddressStore((state) => state.loadAddresses);

  useEffect(() => {
    if (token) {
      void fetchStats();
      void loadWallet();
      void loadAddresses();
      notificationApi.list().then((res) => setNotices(res.data?.records || [])).catch(() => setNotices([]));
      feedbackApi.list().then((res) => setFeedbackTickets(res.data?.records || [])).catch(() => setFeedbackTickets([]));
      profileApi.favorites().then((res) => setFavoriteCount(res.data?.length || 0)).catch(() => setFavoriteCount(0));
    } else {
      setNotices([]);
      setFeedbackTickets([]);
      setFavoriteCount(0);
    }
  }, [fetchStats, loadAddresses, loadWallet, token]);

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
  }, [setTabBarHidden, token]);

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
    setSubPage({ key: page });
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
    setNotices((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    notificationApi.markRead(id).catch(() => undefined);
  }, []);

  const markAllNoticesRead = useCallback(() => {
    setNotices((current) => current.map((item) => ({ ...item, unread: false })));
    notificationApi.markAllRead().catch(() => undefined);
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

  const submitFeedbackTicket = useCallback((
    ticket: Omit<FeedbackTicketItem, 'id' | 'createdAt' | 'status' | 'replies'>,
  ) => {
    const tempId = `TK${Date.now().toString().slice(-8)}`;
    feedbackApi
      .create({
        type: ticket.type,
        title: ticket.title,
        content: ticket.content,
        screenshots: ticket.screenshots,
      })
      .then(() => feedbackApi.list())
      .then((res) => setFeedbackTickets(res.data?.records || []))
      .catch(() => undefined);
    return tempId;
  }, []);

  const profileSummary = useMemo(
    () => buildMineProfileSummary(user, stats, pointsBalance),
    [pointsBalance, stats, user],
  );

  const hasSignedInToday = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
    return lastSignInDate === today;
  }, [lastSignInDate]);

  const handleSignIn = useCallback(() => {
    const signed = signIn();
    if (signed) {
      Alert.alert('签到成功', '今日签到奖励 +20 积分已到账。');
      return;
    }
    Alert.alert('今日已签到', '明天再来领取新的签到奖励。');
  }, [signIn]);

  const unreadNoticeCount = useMemo(
    () => notices.filter((item) => item.unread).length,
    [notices],
  );

  const statItems = useMemo(
    () => buildMineStatItems(stats, favoriteCount * 21),
    [stats, favoriteCount],
  );

  const handleMineAction = useCallback((actionKey: MineActionKey, orderTab?: ProfileOrderFilterTab) => {
    if (actionKey === 'tutorial') {
      Alert.alert('使用教程', '教程中心正在整理内容，稍后会开放完整的新手引导。');
      return;
    }

    if (actionKey === 'orders') {
      openOrders(orderTab, 'root');
      return;
    }

    openPage(actionKey);
  }, [openOrders, openPage]);

  const handleStatPress = useCallback((item: MineStatItem) => {
    handleMineAction(item.actionKey);
  }, [handleMineAction]);

  const handleToolPress = useCallback((item: MineToolItem) => {
    handleMineAction(item.actionKey);
  }, [handleMineAction]);

  const handleOrderPress = useCallback((item: MineOrderShortcut) => {
    handleMineAction(item.actionKey, item.orderTab);
  }, [handleMineAction]);

  const handleMenuPress = useCallback((item: MineMenuItem) => {
    handleMineAction(item.actionKey);
  }, [handleMineAction]);

  const renderSubPage = useCallback(() => {
    switch (subPage.key) {
      case 'editProfile':
        return <EditProfileScreen onBack={handleBackToRoot} />;
      case 'myDesigns':
        return <MyDesignsScreen onBack={handleBackToRoot} />;
      case 'favorites':
        return <FavoritesScreen onBack={handleBackToRoot} />;
      case 'addresses':
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
      case 'likes':
        return <LikesScreen onBack={handleBackToRoot} />;
      case 'likedHistory':
        return <LikedHistoryScreen onBack={handleBackToRoot} />;
      case 'settings':
        return <SettingsScreen onBack={handleBackToRoot} />;
      case 'feedback':
        return (
          <FeedbackScreen
            onBack={handleBackToRoot}
            tickets={feedbackTickets}
            onSubmitTicket={submitFeedbackTicket}
            onOpenTicket={openFeedbackDetail}
          />
        );
      case 'feedbackDetail':
        return (
          <FeedbackDetailScreen
            ticket={feedbackTickets.find((item) => item.id === subPage.ticketId)}
            onBack={() => setSubPage({ key: 'feedback' })}
          />
        );
      case 'myFeeds':
        return <MyFeedsScreen onBack={handleBackToRoot} />;
      case 'purchased':
        return <PurchasedScreen onBack={handleBackToRoot} />;
      case 'wallet':
        return <WalletScreen onBack={handleBackToRoot} />;
      case 'followers':
        return <FollowListScreen type="followers" onBack={handleBackToRoot} />;
      case 'following':
        return <FollowListScreen type="following" onBack={handleBackToRoot} />;
      case 'notifications':
        return (
          <NotificationsScreen
            notices={notices}
            onBack={handleBackToRoot}
            onReadNotice={markNoticeRead}
            onReadAll={markAllNoticesRead}
            onOpenAction={openNoticeAction}
          />
        );
      case 'orders':
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
      case 'orderDetail':
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
      default:
        return null;
    }
  }, [
    addresses,
    createAddress,
    deleteAddress,
    feedbackTickets,
    handleBackToRoot,
    markAllNoticesRead,
    markNoticeRead,
    notices,
    openFeedbackDetail,
    openNoticeAction,
    openOrderDetail,
    openOrders,
    setDefaultAddress,
    submitFeedbackTicket,
    subPage,
    updateAddress,
  ]);

  if (!token) {
    return authMode === 'register' ? (
      <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />
    );
  }

  if (subPage.key !== 'none') {
    return renderSubPage();
  }

  const pageBackground = colors.bg;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBackground }]} edges={['top']}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={(
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          )}
        >
          <ProfileHeader
            title={MINE_PAGE_TITLE}
            unreadCount={unreadNoticeCount}
            onPressMessages={() => handleMineAction('notifications')}
            onPressSettings={() => handleMineAction('settings')}
          />

          <ProfileUserCard
            summary={profileSummary}
            items={statItems}
            onPressProfile={() => handleMineAction('editProfile')}
            onPressStat={handleStatPress}
            onPressSignIn={handleSignIn}
            hasSignedInToday={hasSignedInToday}
          />

          <ProfileOrdersCard
            items={MINE_ORDER_SHORTCUTS}
            onPressAll={() => openOrders('全部' as ProfileOrderFilterTab)}
            onPressItem={handleOrderPress}
          />

          <ProfileToolsGrid items={MINE_TOOL_ITEMS} onPressItem={handleToolPress} />

          <ProfileMenuList items={MINE_MENU_ITEMS} onPressItem={handleMenuPress} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 100,
  },
});

const localStyles = StyleSheet.create({
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionButton: {
    minWidth: 58,
    height: 36,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerActionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  identityWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3B6CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  identityTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  displayName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    maxWidth: '64%',
  },
  genderBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    borderRadius: 999,
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelBadgeText: {
    color: '#2F5FE3',
    fontSize: 10,
    fontWeight: '700',
  },
  signature: {
    fontSize: 11,
    lineHeight: 15,
    paddingRight: 8,
  },
  inlineStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  inlineStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  inlineStatValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  inlineStatLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  inlineStatDivider: {
    width: 1,
    marginVertical: 10,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingHorizontal: 10,
  },
  pointsCompactWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsCompactTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  pointsCompactTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pointsCompactValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  signInButton: {
    minWidth: 74,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#3B6CFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  toolsCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toolItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  toolIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  ordersCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  ordersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  ordersAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ordersAllButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ordersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  orderItem: {
    flex: 1,
    alignItems: 'center',
  },
  orderIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  menuCard: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuLeadingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
    paddingRight: 10,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  menuDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
});

function ProfileCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, dark } = useTheme();

  return (
    <View
      style={[
        localStyles.card,
        {
          backgroundColor: colors.bg,
          borderColor: dark ? colors.divider : '#E5EDFF',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function ProfileHeader({
  title,
  unreadCount,
  onPressMessages,
  onPressSettings,
}: {
  title: string;
  unreadCount: number;
  onPressMessages: () => void;
  onPressSettings: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={localStyles.headerRow}>
      <Text style={[localStyles.headerTitle, { color: colors.text }]}>{title}</Text>
      <View style={localStyles.headerActions}>
        <Pressable
          onPress={onPressMessages}
          style={localStyles.headerIconButton}
        >
          <Feather name="mail" size={23} color={colors.textSecondary} />
          {unreadCount > 0 ? (
            <View style={localStyles.headerBadge}>
              <Text style={localStyles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={onPressSettings}
          style={localStyles.headerIconButton}
        >
          <Feather name="settings" size={23} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function GenderBadge({ gender }: { gender?: string | null }) {
  const normalized = (gender || '').trim().toLowerCase();
  if (!normalized || normalized.includes('保密') || normalized === 'secret') {
    return null;
  }

  const meta = getGenderBadgeMeta(gender);

  return (
    <View style={[localStyles.genderBadge, { backgroundColor: meta.bg }]}>
      <MCI name={meta.icon as any} size={15} color={meta.color} />
    </View>
  );
}

function ProfileUserCard({
  summary,
  items,
  onPressProfile,
  onPressStat,
  onPressSignIn,
  hasSignedInToday,
}: {
  summary: MineProfileSummary;
  items: MineStatItem[];
  onPressProfile: () => void;
  onPressStat: (item: MineStatItem) => void;
  onPressSignIn: () => void;
  hasSignedInToday: boolean;
}) {
  const { colors, dark } = useTheme();
  const secondaryTextColor = dark ? colors.textSecondary : '#6A7E99';

  return (
    <ProfileCard style={localStyles.userCard}>
      <View style={localStyles.userTopRow}>
        <Pressable onPress={onPressProfile} style={localStyles.identityWrap}>
          <View style={localStyles.avatarShell}>
            <View style={localStyles.avatarCore}>
              <Text style={localStyles.avatarText}>{summary.avatarText}</Text>
            </View>
          </View>
          <View style={localStyles.identityTextWrap}>
            <View style={localStyles.nameRow}>
              <Text style={[localStyles.displayName, { color: colors.text }]} numberOfLines={1}>
                {summary.displayName}
              </Text>
              <GenderBadge gender={summary.gender} />
              <View style={localStyles.levelBadge}>
                <Text style={localStyles.levelBadgeText}>{summary.levelLabel}</Text>
              </View>
            </View>
            <Text style={[localStyles.signature, { color: secondaryTextColor }]} numberOfLines={2}>
              {summary.signature}
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={localStyles.inlineStatsRow}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable onPress={() => onPressStat(item)} style={localStyles.inlineStatItem}>
              <Text style={[localStyles.inlineStatValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[localStyles.inlineStatLabel, { color: secondaryTextColor }]}>{item.label}</Text>
            </Pressable>
            {index < items.length - 1 ? (
              <View
                style={[
                  localStyles.inlineStatDivider,
                  { backgroundColor: dark ? colors.divider : 'rgba(148, 163, 184, 0.18)' },
                ]}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>
      <View
        style={[
          localStyles.actionBar,
          {
            borderTopColor: dark ? colors.border : '#E5EDFF',
          },
        ]}
      >
        <View style={localStyles.pointsCompactWrap}>
          <View style={localStyles.pointsCompactTag}>
            <Feather name="award" size={12} color="#F59E0B" />
            <Text style={[localStyles.pointsCompactTagText, { color: secondaryTextColor }]}>积分</Text>
          </View>
          <Text style={[localStyles.pointsCompactValue, { color: colors.text }]}>{summary.pointsValue}</Text>
        </View>
        <Pressable
          onPress={onPressSignIn}
          style={[
            localStyles.signInButton,
            hasSignedInToday && { backgroundColor: dark ? colors.surfaceHover : '#E5EDFF' },
          ]}
        >
          <Feather name={hasSignedInToday ? 'check-circle' : 'calendar'} size={14} color={hasSignedInToday ? colors.textHint : '#FFFFFF'} />
          <Text style={[localStyles.signInText, hasSignedInToday && { color: colors.textHint }]}>
            {hasSignedInToday ? '已签到' : '签到'}
          </Text>
        </Pressable>
      </View>
    </ProfileCard>
  );
}

function ProfileToolsGrid({
  items,
  onPressItem,
}: {
  items: MineToolItem[];
  onPressItem: (item: MineToolItem) => void;
}) {
  const { colors } = useTheme();

  return (
    <ProfileCard style={localStyles.toolsCard}>
      <Text style={[localStyles.sectionTitle, { color: colors.text }]}>常用功能</Text>
      <View style={localStyles.toolsGrid}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onPressItem(item)} style={localStyles.toolItem}>
            <View style={[localStyles.toolIconBubble, { backgroundColor: item.iconBackground }]}>
              <Feather name={item.icon} size={21} color={item.iconTint} />
              {item.badgeCount ? (
                <View style={localStyles.toolBadge}>
                  <Text style={localStyles.toolBadgeText}>{item.badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[localStyles.toolLabel, { color: colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ProfileCard>
  );
}

function ProfileOrdersCard({
  items,
  onPressAll,
  onPressItem,
}: {
  items: MineOrderShortcut[];
  onPressAll: () => void;
  onPressItem: (item: MineOrderShortcut) => void;
}) {
  const { colors, dark } = useTheme();

  return (
    <ProfileCard style={localStyles.ordersCard}>
      <View style={localStyles.ordersHeader}>
        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>我的订单</Text>
        <Pressable onPress={onPressAll} style={localStyles.ordersAllButton}>
          <Text style={[localStyles.ordersAllButtonText, { color: colors.accent }]}>查看全部</Text>
          <Feather name="chevron-right" size={16} color={colors.accent} />
        </Pressable>
      </View>
      <View style={localStyles.ordersRow}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onPressItem(item)} style={localStyles.orderItem}>
            <View
              style={[
                localStyles.orderIconBubble,
                {
                  backgroundColor: dark ? colors.surfaceHover : item.bg,
                  borderColor: dark ? colors.border : item.bg,
                },
              ]}
            >
              <Feather name={item.icon} size={18} color={dark ? colors.accent : item.tint} />
              {item.pendingCount > 0 ? (
                <View style={localStyles.orderBadge}>
                  <Text style={localStyles.orderBadgeText}>{item.pendingCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[localStyles.orderLabel, { color: colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ProfileCard>
  );
}

function ProfileMenuList({
  items,
  onPressItem,
}: {
  items: MineMenuItem[];
  onPressItem: (item: MineMenuItem) => void;
}) {
  const { colors, dark } = useTheme();
  const dividerColor = dark ? colors.divider : '#E8EFFB';
  const secondaryTextColor = dark ? colors.textSecondary : '#7387A1';

  return (
    <ProfileCard style={localStyles.menuCard}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem(item)}
          style={[
            localStyles.menuRow,
            index < items.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: dividerColor,
            },
          ]}
        >
          <View style={[localStyles.menuLeadingIcon, { backgroundColor: dark ? colors.surfaceHover : '#EEF4FF' }]}>
            <Feather name={item.icon} size={18} color={colors.accent} />
          </View>
          <View style={localStyles.menuContent}>
            <Text style={[localStyles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[localStyles.menuDescription, { color: secondaryTextColor }]}>{item.description}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={secondaryTextColor} />
        </Pressable>
      ))}
    </ProfileCard>
  );
}
