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

const MENU_SECTIONS = [
  {
    title: '我的创作',
    items: [
      { key: 'myDesigns', label: '我的作品', icon: '🎨' },
      { key: 'myDrafts', label: '草稿箱', icon: '📝' },
      { key: 'myFavorites', label: '我的收藏', icon: '⭐' },
      { key: 'myLikes', label: '我的点赞', icon: '♥️' },
    ],
  },
  {
    title: '其他',
    items: [
      { key: 'settings', label: '设置', icon: '⚙️' },
      { key: 'feedback', label: '意见反馈', icon: '💬' },
      { key: 'about', label: '关于', icon: 'ℹ️' },
    ],
  },
];

export const ProfileScreen: React.FC = () => {
  const { user, token, stats, logout, fetchStats } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [subPage, setSubPage] = useState<SubPage>('none');

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  // 未登录
  if (!token) {
    if (authMode === 'register') {
      return <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // 子页面
  if (subPage === 'editProfile') {
    return <EditProfileScreen onBack={() => setSubPage('none')} />;
  }
  if (subPage === 'myDesigns') {
    return <MyDesignsScreen onBack={() => setSubPage('none')} />;
  }

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: logout },
    ]);
  };

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'myDesigns':
      case 'myDrafts':
        setSubPage('myDesigns');
        break;
      case 'myFavorites':
        Alert.alert('提示', '收藏功能即将上线');
        break;
      case 'myLikes':
        Alert.alert('提示', '点赞列表即将上线');
        break;
      case 'settings':
        Alert.alert('提示', '设置功能即将上线');
        break;
      case 'feedback':
        Alert.alert('意见反馈', '如有问题请联系 beadforge@example.com');
        break;
      case 'about':
        Alert.alert('关于 BeadForge', 'v1.0.0\n一款拼豆设计与分享应用');
        break;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.profileCard}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={72} />
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{user?.nickname || user?.username}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
            {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setSubPage('editProfile')}>
            <Text style={styles.editBtnText}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        {/* 统计 */}
        <View style={styles.statsRow}>
          <StatItem label="作品" value={stats.designCount} />
          <View style={styles.statsDivider} />
          <StatItem label="获赞" value={stats.likeCount} />
          <View style={styles.statsDivider} />
          <StatItem label="粉丝" value={stats.followerCount} />
          <View style={styles.statsDivider} />
          <StatItem label="关注" value={stats.followingCount} />
        </View>
      </View>

      {/* 菜单 */}
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
  container: { flex: 1, backgroundColor: Colors.grayBg },
  header: { backgroundColor: Colors.white, paddingBottom: Spacing.lg, marginBottom: Spacing.sm },
  headerBg: { height: 100, backgroundColor: Colors.primary },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: -36,
  },
  profileInfo: { flex: 1, marginLeft: Spacing.md, marginTop: 36 },
  nickname: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  username: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  email: { fontSize: FontSize.xs, color: Colors.grayLight, marginTop: 2 },
  editBtn: {
    marginTop: 36,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  editBtnText: { fontSize: FontSize.sm, color: Colors.gray },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  statsDivider: { width: 1, height: 24, backgroundColor: Colors.grayBg },
  menuSection: { marginBottom: Spacing.sm },
  menuSectionTitle: {
    fontSize: FontSize.sm, color: Colors.gray,
    marginLeft: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  menuCard: { backgroundColor: Colors.white, marginHorizontal: Spacing.md, borderRadius: BorderRadius.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  menuItemBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.grayBg },
  menuIcon: { fontSize: 20, width: 32 },
  menuLabel: { flex: 1, fontSize: FontSize.lg, color: Colors.black },
  menuArrow: { fontSize: 22, color: Colors.grayLight },
  logoutWrap: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
});
