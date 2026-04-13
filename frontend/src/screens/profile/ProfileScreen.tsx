import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/common';
import { FontSize, BorderRadius, useTheme } from '../../theme';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { LikesScreen } from './LikesScreen';
import { SettingsScreen } from './SettingsScreen';

const PAD = wp(15);
const W = Dimensions.get('window').width;
const QUICK_W = Math.floor((W - PAD * 2 - wp(10) * 3) / 4);

type SubPage = 'none' | 'editProfile' | 'myDesigns' | 'favorites' | 'likes' | 'settings';

const QUICK = [
  { key: 'myDesigns', label: '作品', icon: 'grid' as const, color: '#4b78ff' },
  { key: 'myDrafts', label: '草稿', icon: 'edit-3' as const, color: '#F97316' },
  { key: 'myFavorites', label: '收藏', icon: 'bookmark' as const, color: '#FBBF24' },
  { key: 'myLikes', label: '点赞', icon: 'heart' as const, color: '#EF4444' },
];

const MENU = [
  { key: 'settings', label: '设置', icon: 'settings' as const },
  { key: 'about', label: '关于 BeadForge', icon: 'info' as const },
];

export const ProfileScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { user, token, stats, logout, fetchStats } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>('none');

  useEffect(() => { if (token) fetchStats(); }, [token]);

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

  const nav = (key: string) => {
    if (key === 'myDesigns' || key === 'myDrafts') setSubPage('myDesigns');
    else if (key === 'myFavorites') setSubPage('favorites');
    else if (key === 'myLikes') setSubPage('likes');
    else if (key === 'settings') setSubPage('settings');
    else if (key === 'about') Alert.alert('BeadForge', 'v1.0.0\n拼豆设计与分享平台');
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* ═══ 顶部 accent 区域：用户信息 + 统计 ═══ */}
      <View style={[$.header, { backgroundColor: colors.accent }]}>
        <View style={$.headerTopRow}>
          <Text style={$.headerTitle}>我的</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setSubPage('settings')}>
            <Feather name="settings" size={fp(18)} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <View style={$.userRow}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={wp(48)} />
          <View style={$.userInfo}>
            <Text style={$.nick} numberOfLines={1}>{user?.nickname || user?.username}</Text>
            <Text style={$.uname}>@{user?.username}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setSubPage('editProfile')} style={$.editBtn}>
            <Text style={$.editBtnT}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        <View style={$.statsRow}>
          {[
            { v: stats.designCount, l: '作品' },
            { v: stats.likeCount, l: '获赞' },
            { v: stats.followerCount, l: '粉丝' },
            { v: stats.followingCount, l: '关注' },
          ].map((s) => (
            <View key={s.l} style={$.statItem}>
              <Text style={$.statV}>{s.v}</Text>
              <Text style={$.statL}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ═══ 内容区 — flex 撑满，不用 ScrollView ═══ */}
      <View style={$.body}>
        {/* 快捷入口 */}
        <View style={[$.quickCard, { backgroundColor: colors.surface }]}>
          {QUICK.map((q) => (
            <TouchableOpacity key={q.key} activeOpacity={0.7} onPress={() => nav(q.key)} style={[$.quickItem, { width: QUICK_W }]}>
              <View style={[$.quickIcon, { backgroundColor: q.color + '15' }]}>
                <Feather name={q.icon} size={fp(17)} color={q.color} />
              </View>
              <Text style={[$.quickLabel, { color: colors.text }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 菜单列表 */}
        <View style={[$.menuCard, { backgroundColor: colors.surface }]}>
          {MENU.map((m, idx) => (
            <TouchableOpacity
              key={m.key} activeOpacity={0.7} onPress={() => nav(m.key)}
              style={[$.menuItem, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
            >
              <Feather name={m.icon} size={fp(16)} color={colors.textSecondary} />
              <Text style={[$.menuLabel, { color: colors.text }]}>{m.label}</Text>
              <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 弹性空间 — 把退出按钮推到底部 */}
        <View style={{ flex: 1 }} />

        {/* 退出 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert('退出登录', '确定要退出吗？', [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive', onPress: logout },
          ])}
          style={[$.logoutBtn, { backgroundColor: colors.surface }]}
        >
          <Text style={$.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={[$.footer, { color: colors.textHint }]}>BeadForge v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },

  /* ── 顶部 ── */
  header: {
    paddingHorizontal: PAD, paddingTop: wp(6), paddingBottom: wp(14),
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: wp(12),
  },
  headerTitle: { fontSize: fp(18), fontWeight: '700', color: '#fff' },

  userRow: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: wp(10) },
  nick: { fontSize: fp(16), fontWeight: '700', color: '#fff' },
  uname: { fontSize: fp(11), color: 'rgba(255,255,255,0.6)', marginTop: wp(2) },
  editBtn: {
    paddingHorizontal: wp(12), paddingVertical: wp(5),
    borderRadius: wp(8), backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editBtnT: { color: '#fff', fontSize: fp(11), fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', marginTop: wp(14),
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: wp(10),
    paddingVertical: wp(10),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statV: { fontSize: fp(16), fontWeight: '800', color: '#fff' },
  statL: { fontSize: fp(10), color: 'rgba(255,255,255,0.6)', marginTop: wp(1) },

  /* ── 内容区 ── */
  body: {
    flex: 1, paddingBottom: wp(60) + BOTTOM_SAFE_H,
  },

  quickCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: PAD, marginTop: wp(12),
    paddingVertical: wp(14), paddingHorizontal: PAD,
    borderRadius: BorderRadius.lg,
  },
  quickItem: { alignItems: 'center' },
  quickIcon: {
    width: wp(38), height: wp(38), borderRadius: wp(11),
    justifyContent: 'center', alignItems: 'center',
  },
  quickLabel: { fontSize: fp(11), fontWeight: '500', marginTop: wp(5) },

  menuCard: {
    marginHorizontal: PAD, marginTop: wp(10),
    borderRadius: BorderRadius.lg, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: wp(13), paddingHorizontal: wp(14),
  },
  menuLabel: { flex: 1, fontSize: fp(14), fontWeight: '500', marginLeft: wp(10) },

  logoutBtn: {
    marginHorizontal: PAD,
    borderRadius: BorderRadius.lg, alignItems: 'center',
    paddingVertical: wp(12),
  },
  logoutText: { color: '#EF4444', fontSize: fp(14), fontWeight: '500' },

  footer: { textAlign: 'center', fontSize: fp(10), marginTop: wp(8), marginBottom: wp(4) },
});
