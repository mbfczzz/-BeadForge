import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Button } from '../../components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';

type SubPage = 'none' | 'editProfile' | 'myDesigns';

const MENU = [
  { key: 'myDesigns', label: '我的作品', sub: '' },
  { key: 'myDrafts', label: '草稿箱', sub: '' },
  { key: 'myFavorites', label: '我的收藏', sub: '' },
  { key: 'myLikes', label: '我的点赞', sub: '' },
  { key: 'settings', label: '设置', sub: '' },
  { key: 'about', label: '关于', sub: 'v1.0.0' },
];

export const ProfileScreen: React.FC = () => {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 个人信息 */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{user?.nickname || user?.username}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
          </View>
          <TouchableOpacity onPress={() => setSubPage('editProfile')}>
            <Text style={styles.editText}>编辑</Text>
          </TouchableOpacity>
        </View>

        {/* 统计 */}
        <View style={styles.statsRow}>
          <Stat value={stats.designCount} label="作品" />
          <Stat value={stats.likeCount} label="获赞" />
          <Stat value={stats.followerCount} label="粉丝" />
          <Stat value={stats.followingCount} label="关注" />
        </View>
      </View>

      {/* 菜单 */}
      <View style={styles.menuWrap}>
        {MENU.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuItem, idx > 0 && styles.menuBorder]}
            onPress={() => handleMenu(item.key)}
            activeOpacity={0.6}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSub}>{item.sub || '›'}</Text>
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

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  nickname: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  username: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  editText: { fontSize: FontSize.md, color: Colors.accent, fontWeight: '600' },

  statsRow: { flexDirection: 'row', marginTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.grayBg, paddingTop: Spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 4 },

  menuWrap: { borderTopWidth: 8, borderTopColor: Colors.grayBg },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  menuBorder: { borderTopWidth: 1, borderTopColor: Colors.grayBg },
  menuLabel: { fontSize: FontSize.lg, color: Colors.black },
  menuSub: { fontSize: FontSize.lg, color: Colors.grayLight },

  logoutWrap: { padding: Spacing.xl },
});
