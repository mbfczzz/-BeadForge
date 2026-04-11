import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Avatar, Button } from '../../components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';

type SubPage = 'none' | 'editProfile' | 'myDesigns';

const MENU_ITEMS = [
  { key: 'myDesigns', label: '我的作品', icon: '🎨', color: Colors.primary },
  { key: 'myDrafts', label: '草稿箱', icon: '📝', color: Colors.orange },
  { key: 'myFavorites', label: '我的收藏', icon: '⭐', color: Colors.yellow },
  { key: 'myLikes', label: '我的点赞', icon: '❤️', color: Colors.pink },
  { key: 'settings', label: '设置', icon: '⚙️', color: Colors.gray },
  { key: 'about', label: '关于', icon: 'ℹ️', color: Colors.blue },
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

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: logout },
    ]);
  };

  const handleMenu = (key: string) => {
    if (key === 'myDesigns' || key === 'myDrafts') setSubPage('myDesigns');
    else if (key === 'about') Alert.alert('🧩 BeadForge', 'v1.0.0\n一款拼豆设计与分享应用');
    else Alert.alert('🚧 开发中', '该功能即将上线');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部卡片 */}
      <View style={styles.headerCard}>
        <View style={styles.headerShadow} />
        <View style={styles.headerInner}>
          <View style={styles.profileRow}>
            <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={72} borderColor={Colors.yellow} />
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{user?.nickname || user?.username}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setSubPage('editProfile')}>
              <Text style={styles.editBtnText}>编辑</Text>
            </TouchableOpacity>
          </View>

          {/* 统计 */}
          <View style={styles.statsRow}>
            <StatBadge icon="🎨" value={stats.designCount} label="作品" color={Colors.primary} />
            <StatBadge icon="❤️" value={stats.likeCount} label="获赞" color={Colors.pink} />
            <StatBadge icon="👥" value={stats.followerCount} label="粉丝" color={Colors.blue} />
            <StatBadge icon="👀" value={stats.followingCount} label="关注" color={Colors.purple} />
          </View>
        </View>
      </View>

      {/* 菜单 */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.menuOuter} onPress={() => handleMenu(item.key)} activeOpacity={0.7}>
            <View style={[styles.menuShadow, { backgroundColor: Colors.shadowGray }]} />
            <View style={styles.menuInner}>
              <View style={[styles.menuIconWrap, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 退出 */}
      <View style={styles.logoutWrap}>
        <Button title="退出登录" onPress={handleLogout} variant="danger" />
      </View>
    </ScrollView>
  );
};

const StatBadge: React.FC<{ icon: string; value: number; label: string; color: string }> = ({
  icon, value, label, color,
}) => (
  <View style={styles.statItem}>
    <View style={[styles.statBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.snow },

  // Header
  headerCard: { margin: Spacing.md, position: 'relative' },
  headerShadow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: '100%', backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.xl,
  },
  headerInner: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: 5,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  nickname: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  username: { fontSize: FontSize.sm, fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  editBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },

  // Stats
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.md, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statIcon: { fontSize: 14, marginRight: 4 },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: FontSize.xs, fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Menu
  menuSection: { paddingHorizontal: Spacing.md, gap: 10, marginTop: Spacing.sm },
  menuOuter: { position: 'relative' },
  menuShadow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: 56, borderRadius: BorderRadius.lg,
  },
  menuInner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12, paddingHorizontal: Spacing.md,
    marginBottom: 3,
    borderWidth: 2, borderColor: Colors.grayBg,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.dark },
  menuArrow: { fontSize: 24, fontWeight: '700', color: Colors.grayLight },

  logoutWrap: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
});
