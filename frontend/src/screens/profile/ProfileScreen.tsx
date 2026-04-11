import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Button, PressableScale } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';

type SubPage = 'none' | 'editProfile' | 'myDesigns';

const MENU = [
  { key: 'myDesigns', label: '我的作品', icon: '🎨', desc: '管理已创作的拼豆图案' },
  { key: 'myDrafts', label: '草稿箱', icon: '📝', desc: '未完成的创作' },
  { key: 'myFavorites', label: '我的收藏', icon: '⭐', desc: '收藏的优质图案' },
  { key: 'myLikes', label: '我的点赞', icon: '❤️', desc: '点赞过的作品' },
  { key: 'settings', label: '设置', icon: '⚙️', desc: '偏好和账号设置' },
  { key: 'about', label: '关于', icon: 'ℹ️', desc: 'BeadForge v1.0.0' },
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

  const handleMenu = (key: string) => {
    if (key === 'myDesigns' || key === 'myDrafts') setSubPage('myDesigns');
    else if (key === 'about') Alert.alert('BeadForge', 'v1.0.0\n拼豆设计与分享平台');
    else Alert.alert('提示', '该功能即将上线');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      {/* 封面头部 */}
      <View style={[styles.headerBg, { backgroundColor: colors.accent }]}>
        {/* 背景装饰拼豆 */}
        <View style={styles.headerDeco}>
          <View style={{ opacity: 0.12 }}>
            <BeadGrid pixels={ALL_PATTERNS[0]} beadSize={6} gap={1} round />
          </View>
        </View>
      </View>

      {/* 用户信息卡片 */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.avatarRow}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={64} />
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.accent }]}
            onPress={() => setSubPage('editProfile')}
          >
            <Text style={styles.editText}>编辑资料</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.nickname, { color: colors.text }]}>{user?.nickname || user?.username}</Text>
        <Text style={[styles.username, { color: colors.textHint }]}>@{user?.username}</Text>
        {user?.email && <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>}

        {/* 统计 */}
        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          {[
            { v: stats.designCount, l: '作品', c: colors.accent },
            { v: stats.likeCount, l: '获赞', c: '#FF6B6B' },
            { v: stats.followerCount, l: '粉丝', c: '#FFA726' },
            { v: stats.followingCount, l: '关注', c: '#42A5F5' },
          ].map((s) => (
            <View key={s.l} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.c }]}>{s.v}</Text>
              <Text style={[styles.statLabel, { color: colors.textHint }]}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 菜单 */}
      <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {MENU.map((item, idx) => (
          <PressableScale
            key={item.key}
            onPress={() => handleMenu(item.key)}
            style={[styles.menuItem, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}
            scale={0.98}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.inputBg }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.menuDesc, { color: colors.textHint }]}>{item.desc}</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textHint }]}>›</Text>
          </PressableScale>
        ))}
      </View>

      <View style={styles.logoutWrap}>
        <Button title="退出登录" onPress={() => {
          Alert.alert('退出登录', '确定？', [
            { text: '取消', style: 'cancel' },
            { text: '确定', style: 'destructive', onPress: logout },
          ]);
        }} variant="danger" />
      </View>

      <Text style={[styles.footer, { color: colors.textHint }]}>BeadForge v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerBg: { height: 100 },
  headerDeco: { position: 'absolute', right: 20, top: 15, opacity: 0.5 },

  profileCard: {
    marginHorizontal: 12, marginTop: -40, borderRadius: BorderRadius.lg,
    borderWidth: 1, padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  editBtn: { borderRadius: BorderRadius.md, paddingHorizontal: 16, paddingVertical: 7 },
  editText: { color: '#FFF', fontSize: FontSize.sm, fontWeight: '600' },
  nickname: { fontSize: FontSize.xxl, fontWeight: '700', marginTop: 12 },
  username: { fontSize: FontSize.sm, marginTop: 2 },
  email: { fontSize: FontSize.xs, marginTop: 4 },

  statsRow: { flexDirection: 'row', marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },

  menuCard: {
    marginHorizontal: 12, marginTop: 12, borderRadius: BorderRadius.lg,
    borderWidth: 1, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuIcon: { fontSize: 18 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: FontSize.md, fontWeight: '500' },
  menuDesc: { fontSize: FontSize.xs, marginTop: 1 },
  menuArrow: { fontSize: 20 },

  logoutWrap: { paddingHorizontal: 12, paddingTop: Spacing.lg },
  footer: { textAlign: 'center', fontSize: FontSize.xs, paddingVertical: Spacing.lg },
});
