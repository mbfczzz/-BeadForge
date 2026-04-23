import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, EditorMode } from '../../navigation/types';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius, candyShadow } from '../../theme';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(15);
const W = Dimensions.get('window').width;
const SIZE_W = Math.floor((W - PAD * 2 - wp(10)) / 2);

/* ──────────────── 数据 ──────────────── */

const SIZES = [
  { label: '小', cols: 9, rows: 9, desc: '钥匙扣', icon: 'key' as const },
  { label: '中', cols: 16, rows: 16, desc: '杯垫', icon: 'coffee' as const },
  { label: '大', cols: 24, rows: 24, desc: '挂画', icon: 'image' as const },
  { label: '宽幅', cols: 32, rows: 16, desc: '书签', icon: 'bookmark' as const },
];

/* ──────────────── 主屏幕 ──────────────── */

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();
  const [sizeIdx, setSizeIdx] = useState(1);

  const go = (mode: EditorMode) => {
    const s = SIZES[sizeIdx];
    navigation.navigate('Editor', { mode, cols: s.cols, rows: s.rows });
  };

  // 糖果化配色（配合 theme.candy 动态取色）
  const methods: { key: EditorMode; icon: string; title: string; desc: string; color: string }[] = [
    { key: 'manual', icon: 'edit-2', title: '手动创作', desc: '逐颗放置珠子，细致打造', color: colors.candy.bubblegum },
    { key: 'image',  icon: 'image',  title: '图片转换', desc: '照片一键生成图纸',       color: colors.candy.mango },
    { key: 'ai',     icon: 'cpu',    title: 'AI 生成',  desc: '文字描述生成创意',        color: colors.candy.grape },
  ];

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 顶部 — 水墨渐变（朱砂→柿红） */}
      <LinearGradient
        colors={dark ? ['#3A1F1C', '#2A1F1C'] as const : ['#C8302B', '#CC7B3F'] as const}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={$.header}
      >
        <View style={$.headerRow}>
          <View style={[$.headerIconWrap, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Feather name="edit-2" size={fp(15)} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$.headerTitle}>创作工坊 ✨</Text>
            <Text style={$.headerSub}>选择方式，开始拼豆之旅</Text>
          </View>
          <View style={$.headerDeco}>
            <Text style={$.headerEmoji}>🧩</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(60) + BOTTOM_SAFE_H }}>
        {/* 画布尺寸 */}
        <Text style={[$.secTitle, { color: colors.text }]}>画布尺寸</Text>
        <View style={$.sizeGrid}>
          {SIZES.map((s, idx) => {
            const on = idx === sizeIdx;
            return (
              <TouchableOpacity
                key={s.label}
                activeOpacity={0.8}
                onPress={() => setSizeIdx(idx)}
                style={[
                  $.sizeCard,
                  {
                    width: SIZE_W,
                    backgroundColor: on ? colors.accent : colors.surface,
                    borderColor: on ? colors.accent : colors.border,
                  },
                  on && candyShadow(colors.accent, 'md'),
                ]}
              >
                <Feather name={s.icon} size={fp(18)} color={on ? '#fff' : colors.textHint} />
                <Text style={[$.sizeLabel, { color: on ? '#fff' : colors.text }]}>{s.label}</Text>
                <Text style={[$.sizeDim, { color: on ? 'rgba(255,255,255,0.85)' : colors.textHint }]}>{s.cols}×{s.rows} · {s.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 创作方式 — 糖果大按钮 */}
        <Text style={[$.secTitle, { color: colors.text }]}>开始创作</Text>
        {methods.map((m) => (
          <TouchableOpacity
            key={m.key}
            activeOpacity={0.85}
            onPress={() => go(m.key)}
            style={[
              $.methodBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadow(3, 10, 0.08, '#5A4A3E', 2),
            ]}
          >
            <View style={[$.methodIcon, { backgroundColor: m.color }, shadow(2, 6, 0.22, m.color, 3)]}>
              <Feather name={m.icon as any} size={fp(20)} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.methodTitle, { color: colors.text }]}>{m.title}</Text>
              <Text style={[$.methodDesc, { color: colors.textHint }]}>{m.desc}</Text>
            </View>
            <View style={[$.methodArrow, { backgroundColor: m.color + '20' }]}>
              <Feather name="arrow-right" size={fp(14)} color={m.color} />
            </View>
          </TouchableOpacity>
        ))}

        {/* 创作灵感 — 糖果色 */}
        <Text style={[$.secTitle, { color: colors.text }]}>创作灵感</Text>
        {[
          { emoji: '🎨', title: '从简单图形开始', desc: '爱心、星星适合新手入门', bg: colors.candy.pink + '40' },
          { emoji: '📸', title: '照片转拼豆',   desc: '拍张照一键生成图纸',     bg: colors.candy.cream + '60' },
          { emoji: '🤖', title: 'AI 帮你画',    desc: '描述想法自动生成图案',   bg: colors.candy.lavender + '50' },
        ].map((tip, i) => (
          <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => go(i === 2 ? 'ai' : i === 1 ? 'image' : 'manual')}
            style={[$.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[$.tipIcon, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : tip.bg }]}>
              <Text style={$.tipEmoji}>{tip.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.tipTitle, { color: colors.text }]}>{tip.title}</Text>
              <Text style={[$.tipDesc, { color: colors.textHint }]}>{tip.desc}</Text>
            </View>
            <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  // 顶部
  header: { paddingHorizontal: PAD, paddingTop: wp(14), paddingBottom: wp(18) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIconWrap: {
    width: wp(32), height: wp(32), borderRadius: wp(16),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
  },
  headerTitle: { fontSize: fp(18), fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.85)', marginTop: wp(3) },
  headerDeco: {
    width: wp(48), height: wp(48), borderRadius: wp(24),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerEmoji: { fontSize: fp(24) },

  secTitle: { fontSize: fp(15), fontWeight: '800', paddingHorizontal: PAD, marginTop: wp(18), marginBottom: wp(10), letterSpacing: 0.3 },

  // 尺寸
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' },
  sizeCard: {
    alignItems: 'center', paddingVertical: wp(14), borderRadius: BorderRadius.xl,
    borderWidth: 1.5, marginBottom: wp(10),
  },
  sizeLabel: { fontSize: fp(15), fontWeight: '800', marginTop: wp(5) },
  sizeDim: { fontSize: fp(10), marginTop: wp(3) },

  // 方式
  methodBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginBottom: wp(10),
    padding: wp(14), borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  methodIcon: {
    width: wp(48), height: wp(48), borderRadius: wp(24),
    justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
  },
  methodTitle: { fontSize: fp(15), fontWeight: '700' },
  methodDesc: { fontSize: fp(11), marginTop: wp(2) },
  methodArrow: {
    width: wp(32), height: wp(32), borderRadius: wp(16),
    justifyContent: 'center', alignItems: 'center',
  },

  // 灵感
  tipItem: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginBottom: wp(8),
    padding: wp(12), borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  tipIcon: {
    width: wp(40), height: wp(40), borderRadius: wp(20),
    justifyContent: 'center', alignItems: 'center',
    marginRight: wp(12),
  },
  tipEmoji: { fontSize: fp(18) },
  tipTitle: { fontSize: fp(14), fontWeight: '700' },
  tipDesc: { fontSize: fp(11), marginTop: wp(2) },
});
