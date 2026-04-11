import React, { useState } from 'react';
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

/** 个人中心菜单项 */
const MENU_SECTIONS = [
  {
    title: '我的创作',
    items: [
      { key: 'myDesigns', label: '我的作品', icon: '🎨', badge: null },
      { key: 'myDrafts', label: '草稿箱', icon: '📝', badge: null },
      { key: 'myFavorites', label: '我的收藏', icon: '⭐', badge: null },
      { key: 'myLikes', label: '我的点赞', icon: '♥️', badge: null },
    ],
  },
  {
    title: '其他',
    items: [
      { key: 'settings', label: '设置', icon: '⚙️', badge: null },
      { key: 'feedback', label: '意见反馈', icon: '💬', badge: null },
      { key: 'about', label: '关于', icon: 'ℹ️', badge: null },
    ],
  },
];

export const ProfileScreen: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 未登录 -> 登录/注册
  if (!token) {
    if (authMode === 'register') {
      return <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />;
  }

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: logout },
    ]);
  };

  const handleMenuPress = (key: string) => {
    // TODO: 导航到对应页面
    Alert.alert('提示', `${key} 功能开发中`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 个人信息头部 */}
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.profileCard}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={72} />
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{user?.nickname || user?.username}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        {/* 统计栏 */}
        <View style={styles.statsRow}>
          <StatItem label="作品" value={0} />
          <View style={styles.statsDivider} />
          <StatItem label="获赞" value={0} />
          <View style={styles.statsDivider} />
          <StatItem label="粉丝" value={0} />
          <View style={styles.statsDivider} />
          <StatItem label="关注" value={0} />
        </View>
      </View>

      {/* 菜单列表 */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, index > 0 && styles.menuItemBorder]}
                onPress={() => handleMenuPress(item.key)}
                activeOpacity={0.6}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* 退出登录 */}
      <View style={styles.logoutWrap}>
        <Button title="退出登录" onPress={handleLogout} variant="outline" />
      </View>
    </ScrollView>
  );
};

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grayBg,
  },
  // Header
  header: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  headerBg: {
    height: 100,
    backgroundColor: Colors.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: -36,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginTop: 36,
  },
  nickname: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.black,
  },
  username: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  editBtn: {
    marginTop: 36,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  editBtnText: {
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.black,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.grayBg,
  },
  // Menu
  menuSection: {
    marginBottom: Spacing.sm,
  },
  menuSectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.grayBg,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.lg,
    color: Colors.black,
  },
  menuArrow: {
    fontSize: 22,
    color: Colors.grayLight,
  },
  // Logout
  logoutWrap: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
