import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Button } from '../../components/common';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';

type SubPage = 'none' | 'editProfile' | 'myDesigns';

const MENU = [
  { key: 'myDesigns', label: '我的作品', icon: '🎨' },
  { key: 'myDrafts', label: '草稿箱', icon: '📝' },
  { key: 'myFavorites', label: '我的收藏', icon: '⭐' },
  { key: 'myLikes', label: '我的点赞', icon: '❤' },
  { key: 'settings', label: '设置', icon: '⚙' },
  { key: 'about', label: '关于', icon: 'ℹ' },
];

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
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
      {/* 个人信息卡 */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.profileRow}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.nickname, { color: colors.text }]}>{user?.nickname || user?.username}</Text>
            <Text style={[styles.username, { color: colors.textHint }]}>@{user?.username}</Text>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.border }]}
            onPress={() => setSubPage('editProfile')}
          >
            <Text style={[styles.editText, { color: colors.textSecondary }]}>编辑</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          <Stat value={stats.designCount} label="作品" colors={colors} />
          <Stat value={stats.likeCount} label="获赞" colors={colors} />
          <Stat value={stats.followerCount} label="粉丝" colors={colors} />
          <Stat value={stats.followingCount} label="关注" colors={colors} />
        </View>
      </View>

      {/* 菜单列表 */}
      <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {MENU.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuItem, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}
            onPress={() => handleMenu(item.key)}
            activeOpacity={0.6}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuArrow, { color: colors.textHint }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutWrap}>
        <Button title="退出登录" onPress={() => {
          Alert.alert('退出登录', '确定？', [
            { text: '取消', style: 'cancel' },
            { text: '确定', style: 'destructive', onPress: logout },
          ]);
        }} variant="outline" />
      </View>
    </ScrollView>
  );
};

const Stat: React.FC<{ value: number; label: string; colors: any }> = ({ value, label, colors }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textHint }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },

  profileCard: {
    margin: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
    padding: Spacing.lg, overflow: 'hidden',
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  nickname: { fontSize: FontSize.xl, fontWeight: '700' },
  username: { fontSize: FontSize.sm, marginTop: 2 },
  editBtn: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 6 },
  editText: { fontSize: FontSize.sm, fontWeight: '500' },

  statsRow: { flexDirection: 'row', marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, marginTop: 4 },

  menuCard: {
    marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md },
  menuIcon: { fontSize: 18, width: 30 },
  menuLabel: { flex: 1, fontSize: FontSize.md },
  menuArrow: { fontSize: 20 },

  logoutWrap: { padding: Spacing.xl },
});
