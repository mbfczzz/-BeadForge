import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { HoverView, PressableScale } from '../../components/common';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(16);

interface SettingGroup { title: string; items: SettingItem[] }
interface SettingItem {
  key: string;
  icon: string;
  label: string;
  type: 'toggle' | 'nav' | 'info';
  value?: string;
}

const GROUPS: SettingGroup[] = [
  {
    title: '通用',
    items: [
      { key: 'darkMode', icon: 'moon', label: '深色模式', type: 'toggle' },
      { key: 'notification', icon: 'bell', label: '消息通知', type: 'toggle' },
      { key: 'autoSave', icon: 'save', label: '自动保存草稿', type: 'toggle' },
    ],
  },
  {
    title: '隐私',
    items: [
      { key: 'profileVisible', icon: 'eye', label: '个人资料可见', type: 'toggle' },
      { key: 'showLikes', icon: 'heart', label: '展示点赞列表', type: 'toggle' },
    ],
  },
  {
    title: '创作',
    items: [
      { key: 'gridDefault', icon: 'grid', label: '默认显示网格线', type: 'toggle' },
      { key: 'defaultSize', icon: 'maximize', label: '默认画布尺寸', type: 'nav', value: '16×16' },
      { key: 'paletteStyle', icon: 'droplet', label: '调色板样式', type: 'nav', value: '按色相排列' },
    ],
  },
  {
    title: '其他',
    items: [
      { key: 'cache', icon: 'trash-2', label: '清除缓存', type: 'nav', value: '12.3 MB' },
      { key: 'feedback', icon: 'message-square', label: '意见反馈', type: 'nav' },
      { key: 'privacy', icon: 'shield', label: '隐私政策', type: 'nav' },
      { key: 'version', icon: 'info', label: '版本', type: 'info', value: 'v1.0.0' },
    ],
  },
];

interface Props { onBack: () => void }

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    darkMode: dark,
    notification: true,
    autoSave: true,
    profileVisible: true,
    showLikes: true,
    gridDefault: true,
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNav = (key: string) => {
    if (key === 'cache') Alert.alert('清除缓存', '已清除 12.3 MB 缓存');
    else if (key === 'feedback') Alert.alert('意见反馈', '感谢您的反馈！请发送邮件至 support@beadforge.app');
    else if (key === 'privacy') Alert.alert('隐私政策', 'BeadForge 尊重并保护您的隐私');
    else Alert.alert('提示', '设置已保存');
  };

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
              {group.items.map((item, idx) => (
                <PressableScale
                  key={item.key}
                  onPress={() => item.type === 'nav' ? handleNav(item.key) : undefined}
                  style={[$.item, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}
                  scale={item.type === 'nav' ? 0.985 : 1}
                >
                  <View style={[$.itemIcon, { backgroundColor: colors.accentLight }]}>
                    <Feather name={item.icon as any} size={fp(14)} color={colors.accent} />
                  </View>
                  <Text style={[$.itemLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.type === 'toggle' && (
                    <Switch
                      value={toggles[item.key] ?? false}
                      onValueChange={() => handleToggle(item.key)}
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor="#fff"
                    />
                  )}
                  {item.type === 'nav' && (
                    <View style={$.itemRight}>
                      {item.value && <Text style={[$.itemValue, { color: colors.textHint }]}>{item.value}</Text>}
                      <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
                    </View>
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
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  itemValue: { fontSize: FontSize.sm },
});
