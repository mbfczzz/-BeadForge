import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { HoverView, PressableScale } from '../../components/common';
import { Toast } from '../../components/common/Toast';
import { useToast, hapticLight, hapticSelection } from '../../hooks/useFeedback';
import { useAuthStore } from '../../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(16);
const SETTINGS_KEY = 'beadforge_settings';

interface Props { onBack: () => void }

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark, toggle: toggleTheme } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const toast = useToast();

  const [settings, setSettings] = useState({
    darkMode: dark,
    notification: true,
    autoSave: true,
    profileVisible: true,
    showLikes: true,
    gridDefault: true,
  });

  // 加载持久化设置
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((v) => {
      if (v) try { setSettings(JSON.parse(v)); } catch {}
    });
  }, []);

  // 保存设置
  const save = (newSettings: typeof settings) => {
    setSettings(newSettings);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const handleToggle = (key: string) => {
    hapticSelection();
    const next = { ...settings, [key]: !(settings as any)[key] };
    save(next);

    // 深色模式联动主题
    if (key === 'darkMode') toggleTheme();
  };

  const handleClearCache = () => {
    Alert.alert('清除缓存', '将清除图片缓存和临时文件', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive', onPress: async () => {
        // 清除 AsyncStorage 中的非关键数据
        const keys = await AsyncStorage.getAllKeys();
        const toRemove = keys.filter((k) => k !== 'beadforge_token' && k !== SETTINGS_KEY);
        if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
        hapticLight();
        toast.show('缓存已清除');
      }},
    ]);
  };

  const handleFeedback = () => {
    Alert.alert('意见反馈', '选择反馈方式', [
      { text: '发送邮件', onPress: () => Linking.openURL('mailto:support@beadforge.app?subject=BeadForge反馈') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const handlePrivacy = () => {
    Alert.alert('隐私政策',
      'BeadForge 尊重并保护您的个人隐私。\n\n' +
      '• 我们仅收集必要的账号信息\n' +
      '• 您的创作数据完全属于您\n' +
      '• 我们不会向第三方出售您的数据\n' +
      '• 您可以随时删除账号和数据',
      [{ text: '我知道了' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert('注销账号', '注销后所有数据将被永久删除，无法恢复。', [
      { text: '取消', style: 'cancel' },
      { text: '确认注销', style: 'destructive', onPress: () => {
        Alert.alert('确认', '真的要注销吗？这个操作无法撤销。', [
          { text: '取消', style: 'cancel' },
          { text: '注销', style: 'destructive', onPress: async () => {
            await logout();
            toast.show('账号已注销');
          }},
        ]);
      }},
    ]);
  };

  const GROUPS = [
    {
      title: '通用',
      items: [
        { key: 'darkMode', icon: 'moon', label: '深色模式', type: 'toggle' as const },
        { key: 'notification', icon: 'bell', label: '消息通知', type: 'toggle' as const },
        { key: 'autoSave', icon: 'save', label: '自动保存草稿', type: 'toggle' as const },
      ],
    },
    {
      title: '隐私',
      items: [
        { key: 'profileVisible', icon: 'eye', label: '个人资料可见', type: 'toggle' as const },
        { key: 'showLikes', icon: 'heart', label: '展示点赞列表', type: 'toggle' as const },
      ],
    },
    {
      title: '创作',
      items: [
        { key: 'gridDefault', icon: 'grid', label: '默认显示网格线', type: 'toggle' as const },
      ],
    },
    {
      title: '其他',
      items: [
        { key: 'cache', icon: 'trash-2', label: '清除缓存', type: 'nav' as const, action: handleClearCache },
        { key: 'feedback', icon: 'message-square', label: '意见反馈', type: 'nav' as const, action: handleFeedback },
        { key: 'privacy', icon: 'shield', label: '隐私政策', type: 'nav' as const, action: handlePrivacy },
        { key: 'version', icon: 'info', label: '版本', type: 'info' as const, value: 'v1.0.0' },
        { key: 'deleteAccount', icon: 'alert-triangle', label: '注销账号', type: 'nav' as const, action: handleDeleteAccount, danger: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>设置</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        {GROUPS.map((group) => (
          <View key={group.title} style={$.group}>
            <Text style={[$.groupTitle, { color: colors.textHint }]}>{group.title}</Text>
            <View style={[$.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {group.items.map((item: any, idx) => (
                <PressableScale
                  key={item.key}
                  onPress={() => item.type === 'nav' && item.action ? item.action() : undefined}
                  style={[$.item, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
                  scale={item.type === 'nav' ? 0.985 : 1}
                >
                  <View style={[$.itemIcon, { backgroundColor: item.danger ? '#FEE2E2' : colors.accentLight }]}>
                    <Feather name={item.icon as any} size={fp(14)} color={item.danger ? '#EF4444' : colors.accent} />
                  </View>
                  <Text style={[$.itemLabel, { color: item.danger ? '#EF4444' : colors.text }]}>{item.label}</Text>
                  {item.type === 'toggle' && (
                    <Switch
                      value={(settings as any)[item.key] ?? false}
                      onValueChange={() => handleToggle(item.key)}
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor="#fff"
                    />
                  )}
                  {item.type === 'nav' && (
                    <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
                  )}
                  {item.type === 'info' && item.value && (
                    <Text style={[$.itemValue, { color: colors.textHint }]}>{item.value}</Text>
                  )}
                </PressableScale>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <Toast message={toast.msg} />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD,
    borderBottomWidth: 1, gap: wp(10),
  },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  group: { paddingHorizontal: PAD, marginTop: wp(20) },
  groupTitle: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: wp(8), marginLeft: wp(4) },
  groupCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden',
    ...shadow(1, 4, 0.05, '#000', 1),
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: wp(14), paddingHorizontal: wp(14), gap: wp(12),
  },
  itemIcon: {
    width: wp(32), height: wp(32), borderRadius: wp(8),
    justifyContent: 'center', alignItems: 'center',
  },
  itemLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
  itemValue: { fontSize: FontSize.sm },
});
