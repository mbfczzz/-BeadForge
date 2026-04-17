import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import { BOTTOM_SAFE_H, fp, wp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getProfilePoints,
  MOCK_PROFILE_FAVORITES,
  MOCK_PROFILE_GIVEN_LIKES,
} from '../../mock/profile';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { LikesScreen } from './LikesScreen';
import { SettingsScreen } from './SettingsScreen';
import { MyFeedsScreen } from './MyFeedsScreen';
import { PurchasedScreen } from './PurchasedScreen';
import { FollowListScreen } from './FollowListScreen';
import { WalletScreen } from './WalletScreen';
import { OrdersScreen } from './OrdersScreen';
import { LikedHistoryScreen } from './LikedHistoryScreen';

const PAD = wp(16);

type SubPage =
  | 'none'
  | 'editProfile'
  | 'myDesigns'
  | 'favorites'
  | 'likes'
  | 'likedHistory'
  | 'settings'
  | 'myFeeds'
  | 'purchased'
  | 'followers'
  | 'following'
  | 'wallet'
  | 'orders';

export const ProfileScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { user, token, stats, fetchStats } = useAuthStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>('none');
  const [refreshing, setRefreshing] = useState(false);
  const [signedToday, setSignedToday] = useState(false);

  useEffect(() => {
    if (token) {
      void fetchStats();
    }
  }, [fetchStats, token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchStats();
    } finally {
      setRefreshing(false);
    }
  }, [fetchStats]);

  if (!token) {
    return authMode === 'register'
      ? <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
      : <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />;
  }

  if (subPage === 'editProfile') return <EditProfileScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'myDesigns') return <MyDesignsScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'favorites') return <FavoritesScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'likes') return <LikesScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'likedHistory') return <LikedHistoryScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'settings') return <SettingsScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'myFeeds') return <MyFeedsScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'purchased') return <PurchasedScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'wallet') return <WalletScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'orders') return <OrdersScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'followers') return <FollowListScreen type="followers" onBack={() => setSubPage('none')} />;
  if (subPage === 'following') return <FollowListScreen type="following" onBack={() => setSubPage('none')} />;

  const displayName = user?.nickname || user?.username || '测试用户';
  const account = user?.username || 'demo';
  const points = getProfilePoints(stats);
  const draftCount = Math.max(1, Math.round(stats.designCount / 3));

  const statItems = [
    { key: 'myDesigns' as const, label: '作品', value: stats.designCount },
    { key: 'likes' as const, label: '获赞', value: stats.likeCount },
    { key: 'followers' as const, label: '粉丝', value: stats.followerCount },
    { key: 'following' as const, label: '关注', value: stats.followingCount },
  ];

  const quickItems = [
    { key: 'myDesigns' as const, label: '作品', value: stats.designCount, icon: 'grid' as const },
    { key: 'myDesigns' as const, label: '草稿', value: draftCount, icon: 'file-text' as const },
    { key: 'favorites' as const, label: '收藏', value: MOCK_PROFILE_FAVORITES.length, icon: 'bookmark' as const },
    { key: 'likedHistory' as const, label: '点赞', value: MOCK_PROFILE_GIVEN_LIKES.length, icon: 'heart' as const },
  ];

  const menuItems = [
    { key: 'orders' as const, label: '我的订单', desc: '查看材料订单和当前状态', icon: 'shopping-bag' as const },
    { key: 'purchased' as const, label: '已购图纸', desc: '查看已经购买的图纸资源', icon: 'file-text' as const },
    { key: 'myFeeds' as const, label: '我的动态', desc: '查看我发布的社区内容', icon: 'message-circle' as const },
    { key: 'wallet' as const, label: '积分钱包', desc: '查看积分余额和记录', icon: 'credit-card' as const },
  ];

  const toolItems = [
    { key: 'settings' as const, label: '设置', icon: 'settings' as const },
    { key: 'about' as const, label: '关于 BeadForge', icon: 'info' as const },
  ];

  const openMenu = (key: string) => {
    if (key === 'about') {
      Alert.alert('BeadForge', '当前界面使用本地 mock 数据演示。');
      return;
    }

    setSubPage(key as SubPage);
  };

  const handleSignIn = () => {
    if (signedToday) {
      Alert.alert('今日已签到', '明天再来。');
      return;
    }

    setSignedToday(true);
    Alert.alert('签到成功', '今日签到已记录。');
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: dark ? colors.bg : '#fff' }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(32) + BOTTOM_SAFE_H }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={$.header}>
          <Text style={[$.title, { color: colors.text }]}>我的</Text>
          <View style={$.headerActions}>
            <TouchableOpacity
              style={[$.headerButton, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.75}
              onPress={() => Alert.alert('系统通知', '当前为本地演示环境，暂无新通知。')}
            >
              <Feather name="bell" size={fp(16)} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[$.headerButton, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.75}
              onPress={() => setSubPage('settings')}
            >
              <Feather name="settings" size={fp(16)} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={$.profileRow}>
            <TouchableOpacity
              style={$.profileMain}
              activeOpacity={0.8}
              onPress={() => setSubPage('editProfile')}
            >
              <Avatar uri={user?.avatar} name={displayName} size={wp(58)} />
              <View style={$.profileText}>
                <Text style={[$.name, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
                <Text style={[$.account, { color: colors.textHint }]} numberOfLines={1}>
                  账号：{account}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[$.pointsCard, { backgroundColor: colors.inputBg }]}>
              <Text style={[$.pointsLabel, { color: colors.textHint }]}>积分</Text>
              <Text style={[$.pointsValue, { color: colors.text }]}>{points}</Text>
            </View>
          </View>

          <View style={$.actionsRow}>
            <View style={$.statsRow}>
              {statItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={$.statItem}
                  activeOpacity={0.75}
                  onPress={() => openMenu(item.key)}
                >
                  <Text style={[$.statValue, { color: colors.text }]}>{item.value}</Text>
                  <Text style={[$.statLabel, { color: colors.textHint }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                $.signButton,
                {
                  backgroundColor: signedToday ? colors.inputBg : colors.accentLight,
                  borderColor: signedToday ? colors.border : colors.accentLight,
                },
              ]}
              activeOpacity={0.75}
              onPress={handleSignIn}
            >
              <Text style={[$.signButtonText, { color: signedToday ? colors.textHint : colors.accent }]}>
                {signedToday ? '已签到' : '签到'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>快捷入口</Text>
          <View style={$.quickGrid}>
            {quickItems.map((item) => (
              <TouchableOpacity
                key={`${item.key}-${item.label}`}
                activeOpacity={0.75}
                onPress={() => openMenu(item.key)}
                style={[$.quickItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[$.quickIcon, { backgroundColor: colors.accentLight }]}>
                  <Feather name={item.icon} size={fp(16)} color={colors.accent} />
                </View>
                <Text style={[$.quickValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[$.quickLabel, { color: colors.textHint }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>内容管理</Text>
          <View style={[$.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.75}
                onPress={() => openMenu(item.key)}
                style={[
                  $.listItem,
                  index > 0 ? { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth } : null,
                ]}
              >
                <View style={[$.listIcon, { backgroundColor: colors.accentLight }]}>
                  <Feather name={item.icon} size={fp(15)} color={colors.accent} />
                </View>
                <View style={$.listText}>
                  <Text style={[$.listLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[$.listDesc, { color: colors.textHint }]}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={fp(15)} color={colors.textHint} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>其他</Text>
          <View style={[$.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {toolItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.75}
                onPress={() => openMenu(item.key)}
                style={[
                  $.toolItem,
                  index > 0 ? { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth } : null,
                ]}
              >
                <View style={[$.toolIcon, { backgroundColor: colors.inputBg }]}>
                  <Feather name={item.icon} size={fp(14)} color={colors.textSecondary} />
                </View>
                <Text style={[$.toolLabel, { color: colors.text }]}>{item.label}</Text>
                <Feather name="chevron-right" size={fp(15)} color={colors.textHint} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: wp(8),
  },
  title: {
    fontSize: fp(24),
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(10),
  },
  card: {
    marginHorizontal: PAD,
    marginTop: wp(8),
    borderRadius: wp(20),
    borderWidth: 1,
    padding: wp(16),
    ...shadow(1, 8, 0.05, '#000', 1),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    marginLeft: wp(12),
    flex: 1,
  },
  name: {
    fontSize: fp(18),
    fontWeight: '700',
  },
  account: {
    fontSize: fp(12),
    marginTop: wp(4),
  },
  pointsCard: {
    minWidth: wp(72),
    borderRadius: wp(14),
    paddingVertical: wp(10),
    paddingHorizontal: wp(12),
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: fp(10),
    marginBottom: wp(4),
  },
  pointsValue: {
    fontSize: fp(18),
    fontWeight: '700',
  },
  actionsRow: {
    marginTop: wp(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: wp(8),
    paddingRight: wp(8),
  },
  statItem: {
    width: wp(54),
    alignItems: 'center',
  },
  statValue: {
    fontSize: fp(17),
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
  signButton: {
    flexShrink: 0,
    marginLeft: wp(4),
    paddingHorizontal: wp(14),
    height: wp(30),
    borderRadius: wp(15),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signButtonText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  section: {
    marginTop: wp(20),
  },
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '700',
    marginBottom: wp(10),
    paddingHorizontal: PAD,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PAD,
    justifyContent: 'space-between',
  },
  quickItem: {
    width: '48%' as const,
    borderRadius: wp(16),
    borderWidth: 1,
    paddingVertical: wp(16),
    paddingHorizontal: wp(14),
    marginBottom: wp(10),
  },
  quickIcon: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickValue: {
    fontSize: fp(18),
    fontWeight: '700',
    marginTop: wp(12),
  },
  quickLabel: {
    fontSize: fp(12),
    marginTop: wp(4),
  },
  listCard: {
    marginHorizontal: PAD,
    borderRadius: wp(18),
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  listIcon: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
    marginLeft: wp(12),
  },
  listLabel: {
    fontSize: fp(14),
    fontWeight: '600',
  },
  listDesc: {
    fontSize: fp(11),
    marginTop: wp(3),
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  toolIcon: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolLabel: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '500',
    marginLeft: wp(12),
  },
});
