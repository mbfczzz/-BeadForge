import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import { wp, fp, BOTTOM_SAFE_H, screenW } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useAuthStore } from '../../store/useAuthStore';
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

const PAD = wp(16);

type SubPage =
  | 'none' | 'editProfile' | 'myDesigns' | 'favorites'
  | 'likes' | 'settings' | 'myFeeds' | 'purchased'
  | 'followers' | 'following' | 'wallet';

// 糖果马卡龙配色：color 做图标 / bg 做柔底
const QUICK = [
  { key: 'myDesigns',   label: '作品', icon: 'grid' as const,     color: '#FF8FB1', bg: '#FFE8F0' },
  { key: 'myDrafts',    label: '草稿', icon: 'edit-3' as const,   color: '#FFB894', bg: '#FFF1E4' },
  { key: 'myFavorites', label: '收藏', icon: 'bookmark' as const, color: '#FFC870', bg: '#FFF6E0' },
  { key: 'myLikes',     label: '点赞', icon: 'heart' as const,    color: '#FF7A95', bg: '#FFE5EC' },
];

const MENU_CONTENT = [
  { key: 'wallet',    label: '拼豆币钱包', icon: 'dollar-sign' as const,    desc: '充值·余额·交易记录', iconColor: '#FFB740', iconBg: '#FFF3D1' },
  { key: 'myFeeds',   label: '我的动态',   icon: 'message-circle' as const, desc: '查看已发布的动态',   iconColor: '#B67CFF', iconBg: '#F1E5FF' },
  { key: 'purchased', label: '已购图纸',   icon: 'shopping-bag' as const,   desc: '已购买的图纸资源',   iconColor: '#6ED39F', iconBg: '#E1F5EA' },
];

const MENU_OTHER = [
  { key: 'settings', label: '设置',        icon: 'settings' as const, iconColor: '#7A6C7A', iconBg: '#F4EFF2' },
  { key: 'about',    label: '关于 BeadForge', icon: 'info' as const,  iconColor: '#7A6C7A', iconBg: '#F4EFF2' },
];

/** 数字格式化：1200 → 1.2k */
const fmtNum = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const ProfileScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { user, token, stats, logout, fetchStats } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>('none');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (token) fetchStats(); }, [token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchStats(); } catch {}
    setRefreshing(false);
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
  if (subPage === 'settings') return <SettingsScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'myFeeds') return <MyFeedsScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'purchased') return <PurchasedScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'wallet') return <WalletScreen onBack={() => setSubPage('none')} />;
  if (subPage === 'followers') return <FollowListScreen type="followers" onBack={() => setSubPage('none')} />;
  if (subPage === 'following') return <FollowListScreen type="following" onBack={() => setSubPage('none')} />;

  const nav = (key: string) => {
    if (key === 'myDesigns' || key === 'myDrafts') setSubPage('myDesigns');
    else if (key === 'myFavorites') setSubPage('favorites');
    else if (key === 'myLikes') setSubPage('likes');
    else if (key === 'myFeeds') setSubPage('myFeeds');
    else if (key === 'purchased') setSubPage('purchased');
    else if (key === 'wallet') setSubPage('wallet');
    else if (key === 'settings') setSubPage('settings');
    else if (key === 'about') Alert.alert('BeadForge', 'v1.0.0\n拼豆设计与分享平台');
  };

  const statItems = [
    { v: stats.designCount, l: '作品', key: 'myDesigns' as SubPage },
    { v: stats.likeCount, l: '获赞', key: 'none' as SubPage },
    { v: stats.followerCount, l: '粉丝', key: 'followers' as SubPage },
    { v: stats.followingCount, l: '关注', key: 'following' as SubPage },
  ];

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp(70) + BOTTOM_SAFE_H }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* ═══ 顶部糖果渐变（粉 → 桃 → 紫薰衣草） ═══ */}
        <LinearGradient
          colors={dark
            ? ['#3D1F32', '#2A1A28', '#1A1220']
            : ['#FF8FB1', '#FFB894', '#D4B8FF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={$.header}
        >
          {/* 装饰圆圈 */}
          <View style={$.decoCircle1} />
          <View style={$.decoCircle2} />

          {/* 顶栏 */}
          <View style={$.headerTopRow}>
            <Text style={$.headerTitle}>我的</Text>
            <View style={$.headerActions}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSubPage('settings')} style={$.headerIconBtn}>
                <Feather name="settings" size={fp(17)} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 用户信息 */}
          <View style={$.userRow}>
            <View style={$.avatarWrap}>
              <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={wp(58)} />
              <View style={$.avatarBadge}>
                <Feather name="check" size={fp(8)} color="#fff" />
              </View>
            </View>
            <View style={$.userInfo}>
              <Text style={$.nick} numberOfLines={1}>{user?.nickname || user?.username}</Text>
              <Text style={$.uname}>@{user?.username}</Text>
              {user?.email && (
                <View style={$.emailRow}>
                  <Feather name="mail" size={fp(9)} color="rgba(255,255,255,0.4)" />
                  <Text style={$.emailText}>{user.email}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSubPage('editProfile')} style={$.editBtn}>
              <Feather name="edit-2" size={fp(11)} color="#fff" />
              <Text style={$.editBtnT}>编辑</Text>
            </TouchableOpacity>
          </View>

          {/* 统计栏 */}
          <View style={$.statsRow}>
            {statItems.map((s, idx) => (
              <React.Fragment key={s.l}>
                {idx > 0 && <View style={$.statDivider} />}
                <TouchableOpacity
                  activeOpacity={s.key !== 'none' ? 0.7 : 1}
                  onPress={() => s.key !== 'none' && setSubPage(s.key)}
                  style={$.statItem}
                >
                  <Text style={$.statV}>{fmtNum(s.v)}</Text>
                  <Text style={$.statL}>{s.l}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* ═══ 快捷入口 — 浮动卡片 ═══ */}
        <View style={[$.quickCard, {
          backgroundColor: colors.surface,
          borderColor: dark ? colors.border : 'transparent',
          borderWidth: dark ? 1 : 0,
          // 暗模式下不要糖果粉阴影（会被背景吞掉），改用无阴影
          ...(dark ? { shadowOpacity: 0, elevation: 0 } : shadow(4, 14, 0.12, '#FF8FB1', 4)),
        }]}>
          {QUICK.map((q, idx) => (
            <TouchableOpacity key={q.key} activeOpacity={0.6} onPress={() => nav(q.key)} style={$.quickItem}>
              <View style={[$.quickIcon, { backgroundColor: dark ? q.color + '18' : q.bg }]}>
                <Feather name={q.icon} size={fp(18)} color={q.color} />
              </View>
              <Text style={[$.quickLabel, { color: colors.text }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ 内容管理 ═══ */}
        <View style={$.sectionRow}>
          <Text style={[$.sectionTitle, { color: colors.textSecondary }]}>内容管理</Text>
        </View>
        <View style={[$.menuCard, {
          backgroundColor: colors.surface,
          borderColor: dark ? colors.border : 'transparent',
          borderWidth: dark ? 1 : 0,
          ...(dark ? { shadowOpacity: 0, elevation: 0 } : shadow(2, 8, 0.06, '#FF8FB1', 1)),
        }]}>
          {MENU_CONTENT.map((m, idx) => (
            <TouchableOpacity
              key={m.key} activeOpacity={0.6} onPress={() => nav(m.key)}
              style={[$.menuItemLarge, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
            >
              <View style={[$.menuIconWrap, { backgroundColor: dark ? m.iconColor + '18' : m.iconBg }]}>
                <Feather name={m.icon} size={fp(16)} color={m.iconColor} />
              </View>
              <View style={$.menuTextWrap}>
                <Text style={[$.menuLabelLg, { color: colors.text }]}>{m.label}</Text>
                <Text style={[$.menuDesc, { color: colors.textHint }]}>{m.desc}</Text>
              </View>
              <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ 其他 ═══ */}
        <View style={$.sectionRow}>
          <Text style={[$.sectionTitle, { color: colors.textSecondary }]}>其他</Text>
        </View>
        <View style={[$.menuCard, {
          backgroundColor: colors.surface,
          borderColor: dark ? colors.border : 'transparent',
          borderWidth: dark ? 1 : 0,
          ...(dark ? { shadowOpacity: 0, elevation: 0 } : shadow(2, 8, 0.06, '#FF8FB1', 1)),
        }]}>
          {MENU_OTHER.map((m, idx) => (
            <TouchableOpacity
              key={m.key} activeOpacity={0.6} onPress={() => nav(m.key)}
              style={[$.menuItem, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
            >
              <View style={[$.menuIconWrapSm, { backgroundColor: dark ? m.iconColor + '18' : m.iconBg }]}>
                <Feather name={m.icon} size={fp(14)} color={m.iconColor} />
              </View>
              <Text style={[$.menuLabel, { color: colors.text }]}>{m.label}</Text>
              <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ 退出 ═══ */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => Alert.alert('退出登录', '确定要退出吗？', [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive', onPress: logout },
          ])}
          style={[$.logoutBtn, { backgroundColor: dark ? '#2a1a1a' : '#FFF5F5' }]}
        >
          <Feather name="log-out" size={fp(14)} color="#EF4444" />
          <Text style={$.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={[$.footer, { color: colors.textHint }]}>BeadForge v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },

  /* ── 顶部渐变 ── */
  header: {
    paddingHorizontal: PAD, paddingTop: wp(8), paddingBottom: wp(24),
    borderBottomLeftRadius: wp(24), borderBottomRightRadius: wp(24),
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', top: -wp(30), right: -wp(20),
    width: wp(120), height: wp(120), borderRadius: wp(60),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle2: {
    position: 'absolute', bottom: -wp(10), left: -wp(30),
    width: wp(80), height: wp(80), borderRadius: wp(40),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: wp(16),
  },
  headerTitle: { fontSize: fp(19), fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', gap: wp(8) },
  headerIconBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },

  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatarBadge: {
    position: 'absolute', bottom: wp(0), right: wp(0),
    width: wp(16), height: wp(16), borderRadius: wp(8),
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  userInfo: { flex: 1, marginLeft: wp(14) },
  nick: { fontSize: fp(18), fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  uname: { fontSize: fp(11), color: 'rgba(255,255,255,0.55)', marginTop: wp(2) },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(3) },
  emailText: { fontSize: fp(9), color: 'rgba(255,255,255,0.4)' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(5),
    paddingHorizontal: wp(14), paddingVertical: wp(7),
    borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  editBtnT: { color: '#fff', fontSize: fp(11), fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: wp(18),
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: wp(14),
    paddingVertical: wp(14),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statV: { fontSize: fp(19), fontWeight: '800', color: '#fff' },
  statL: { fontSize: fp(10), color: 'rgba(255,255,255,0.55)', marginTop: wp(3), fontWeight: '500' },
  statDivider: {
    width: 1, height: wp(24),
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  /* ── 快捷入口 ── */
  quickCard: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: PAD, marginTop: -wp(12),
    paddingVertical: wp(18),
    borderRadius: wp(24),
    // 注：阴影不在这里加，在 JSX 里按 dark/light 分支加，避免被 inline style 覆盖
  },
  quickItem: { alignItems: 'center', width: (screenW - PAD * 2) / 4 },
  quickIcon: {
    width: wp(48), height: wp(48), borderRadius: wp(24),
    justifyContent: 'center', alignItems: 'center',
  },
  quickLabel: { fontSize: fp(11), fontWeight: '600', marginTop: wp(7) },

  /* ── 分区 ── */
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginTop: wp(22), marginBottom: wp(8),
  },
  sectionTitle: {
    fontSize: fp(12), fontWeight: '600', letterSpacing: 0.5,
  },

  /* ── 菜单 ── */
  menuCard: {
    marginHorizontal: PAD,
    borderRadius: wp(20), overflow: 'hidden',
    // 注：阴影在 JSX 按 dark 分支加
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: wp(13), paddingHorizontal: wp(14), gap: wp(12),
  },
  menuItemLarge: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: wp(15), paddingHorizontal: wp(14),
  },
  menuIconWrap: {
    width: wp(38), height: wp(38), borderRadius: wp(11),
    justifyContent: 'center', alignItems: 'center',
  },
  menuIconWrapSm: {
    width: wp(32), height: wp(32), borderRadius: wp(9),
    justifyContent: 'center', alignItems: 'center',
  },
  menuTextWrap: { flex: 1, marginLeft: wp(12) },
  menuLabel: { flex: 1, fontSize: fp(14), fontWeight: '500' },
  menuLabelLg: { fontSize: fp(14), fontWeight: '600' },
  menuDesc: { fontSize: fp(11), marginTop: wp(2) },

  /* ── 退出 ── */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: wp(6),
    marginHorizontal: PAD, marginTop: wp(28),
    borderRadius: wp(14),
    paddingVertical: wp(14),
  },
  logoutText: { color: '#EF4444', fontSize: fp(14), fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: fp(10), marginTop: wp(12), marginBottom: wp(6) },
});
