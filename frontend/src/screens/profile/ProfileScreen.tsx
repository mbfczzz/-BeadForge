import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Avatar, Button, PressableScale, HoverView } from '../../components/common';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { MyDesignsScreen } from './MyDesignsScreen';

type SubPage = 'none' | 'editProfile' | 'myDesigns';

const MENU: { key: string; label: string; icon: string; desc: string }[] = [
  { key: 'myDesigns', label: '我的作品', icon: 'view-grid-outline', desc: '管理已创作的拼豆图案' },
  { key: 'myDrafts', label: '草稿箱', icon: 'file-edit-outline', desc: '未完成的创作' },
  { key: 'myFavorites', label: '我的收藏', icon: 'star-outline', desc: '收藏的优质图案' },
  { key: 'myLikes', label: '我的点赞', icon: 'heart-outline', desc: '点赞过的作品' },
  { key: 'settings', label: '设置', icon: 'cog-outline', desc: '偏好和账号设置' },
  { key: 'about', label: '关于', icon: 'information-outline', desc: 'BeadForge v1.0.0' },
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

  const STATS = [
    { v: stats.designCount, l: '作品', c: colors.accent },
    { v: stats.likeCount, l: '获赞', c: '#FF6B6B' },
    { v: stats.followerCount, l: '粉丝', c: '#F5A623' },
    { v: stats.followingCount, l: '关注', c: '#20C997' },
  ];

  return (
    <ScrollView style={[S.root, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      {/* 封面 - 渐变 */}
      <View style={[S.cover, { backgroundColor: colors.accent },
        Platform.OS === 'web' && { backgroundImage: `linear-gradient(135deg, ${colors.accentGradStart} 0%, ${colors.accentGradEnd} 100%)` } as any,
      ]}>
        <SafeAreaView edges={['top']} />
      </View>

      {/* 用户卡片 */}
      <View style={[S.profileCard, { backgroundColor: colors.surface }]}>
        <View style={S.avatarRow}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={wp(72)} />
          <HoverView
            style={[S.editBtn, { backgroundColor: colors.accent }]}
            onPress={() => setSubPage('editProfile')}
            hoverScale={1.06} hoverLift={0} dataClass="hover-btn"
          >
            <Text style={S.editBtnT}>编辑资料</Text>
          </HoverView>
        </View>
        <Text style={[S.nick, { color: colors.text }]}>{user?.nickname || user?.username}</Text>
        <Text style={[S.uname, { color: colors.textHint }]}>@{user?.username}</Text>
        {user?.email && <Text style={[S.email, { color: colors.textSecondary }]}>{user.email}</Text>}

        {/* 统计 */}
        <View style={[S.statsRow, { borderTopColor: colors.divider }]}>
          {STATS.map((s) => (
            <TouchableOpacity key={s.l} style={S.statItem} activeOpacity={0.7}>
              <Text style={[S.statV, { color: s.c }]}>{s.v}</Text>
              <Text style={[S.statL, { color: colors.textHint }]}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 菜单 */}
      <View style={[S.menuCard, { backgroundColor: colors.surface }]}>
        {MENU.map((item, idx) => (
          <PressableScale
            key={item.key}
            onPress={() => handleMenu(item.key)}
            style={[S.menuItem, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
            scale={0.985}
            dataClass="menu"
          >
            <View style={[S.menuIconW, { backgroundColor: colors.accentLight }]}>
              <Icon name={item.icon as any} size={wp(22)} color={colors.accent} />
            </View>
            <View style={S.menuTextW}>
              <Text style={[S.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[S.menuDesc, { color: colors.textHint }]}>{item.desc}</Text>
            </View>
            <Icon name="chevron-right" size={wp(20)} color={colors.textHint} />
          </PressableScale>
        ))}
      </View>

      <View style={S.logoutW}>
        <Button title="退出登录" onPress={() => {
          Alert.alert('退出登录', '确定要退出吗？', [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive', onPress: logout },
          ]);
        }} variant="danger" />
      </View>

      <Text style={[S.footer, { color: colors.textHint }]}>BeadForge v1.0.0 · 用心拼出精彩</Text>
    </ScrollView>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },

  cover: { height: wp(130) },

  profileCard: {
    marginHorizontal: wp(16), marginTop: -wp(40),
    borderRadius: wp(18), padding: wp(22),
    ...shadow(0, 8, 0.1, '#000', 5),
  },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  editBtn: { borderRadius: wp(12), paddingHorizontal: wp(18), paddingVertical: wp(8) },
  editBtnT: { color: '#FFF', fontSize: fp(13), fontWeight: '600' },
  nick: { fontSize: fp(22), fontWeight: '800', marginTop: wp(14), letterSpacing: 0.2 },
  uname: { fontSize: fp(13), marginTop: wp(3) },
  email: { fontSize: fp(12), marginTop: wp(6) },

  statsRow: { flexDirection: 'row', marginTop: wp(20), paddingTop: wp(16), borderTopWidth: StyleSheet.hairlineWidth },
  statItem: { flex: 1, alignItems: 'center' },
  statV: { fontSize: fp(20), fontWeight: '800' },
  statL: { fontSize: fp(11), marginTop: wp(4), fontWeight: '500', letterSpacing: 0.5 },

  menuCard: {
    marginHorizontal: wp(16), marginTop: wp(16),
    borderRadius: wp(16), overflow: 'hidden',
    ...shadow(0, 6, 0.08, '#000', 3),
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: wp(15), paddingHorizontal: wp(18) },
  menuIconW: {
    width: wp(40), height: wp(40), borderRadius: wp(12),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
  },
  menuTextW: { flex: 1 },
  menuLabel: { fontSize: fp(15), fontWeight: '600' },
  menuDesc: { fontSize: fp(11), marginTop: wp(3), letterSpacing: 0.2 },

  logoutW: { paddingHorizontal: wp(16), paddingTop: wp(20) },
  footer: {
    textAlign: 'center', fontSize: fp(11),
    paddingTop: wp(20), paddingBottom: wp(60) + BOTTOM_SAFE_H + wp(16),
  },
});
