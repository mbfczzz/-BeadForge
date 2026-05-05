import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EditorMode, CreateMethodOption, CreateSizeOption, CreateTipOption } from '../../api/create';
import type { RootStackParamList } from '../../navigation/types';
import type { DesignItem } from '../../api/design';
import { Feather } from '@expo/vector-icons';
import { useTheme, BorderRadius } from '../../theme';
import { useDesignStore } from '../../store/useDesignStore';
import { ALL_PATTERNS, BeadGrid } from '../../components/common';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { useUiConfig } from '../../store/useUiConfigStore';

const FALLBACK_SIZES: CreateSizeOption[] = [
  { label: '小', cols: 9, rows: 9, desc: '钥匙扣', icon: 'key' },
  { label: '中', cols: 16, rows: 16, desc: '杯垫', icon: 'coffee' },
  { label: '大', cols: 24, rows: 24, desc: '挂画', icon: 'image' },
  { label: '宽幅', cols: 32, rows: 16, desc: '书签', icon: 'bookmark' },
];
const FALLBACK_METHODS: CreateMethodOption[] = [
  { key: 'manual', icon: 'edit-2', title: '手动创作', desc: '逐颗放置珠子并手动调整结构。', color: '#4B78FF' },
];
const FALLBACK_TIPS: CreateTipOption[] = [];

// designData 后端是 JSON 字符串、本地 mock 可能是数组，做容错解析
function parseDesignGrid(raw: unknown): string[][] | null {
  if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) return raw as string[][];
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
        return parsed as string[][];
      }
    } catch { /* ignore */ }
  }
  return null;
}

function formatRelative(iso: string | undefined): string {
  if (!iso) return '';
  const t = new Date(iso.replace(' ', 'T')).getTime();
  if (isNaN(t)) return iso.slice(0, 10);
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return iso.slice(0, 10);
}

const PAD = wp(15);
const W = Dimensions.get('window').width;
const SIZE_W = Math.floor((W - PAD * 2 - wp(10)) / 2);

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();
  const [sizeIdx, setSizeIdx] = useState(1);

  const recentDrafts = useDesignStore((s) => s.recentDrafts);
  const recentDraftsLoading = useDesignStore((s) => s.recentDraftsLoading);
  const loadRecentDrafts = useDesignStore((s) => s.loadRecentDrafts);

  const sizes = useUiConfig<CreateSizeOption[]>('create.sizes', FALLBACK_SIZES);
  const methods = useUiConfig<CreateMethodOption[]>('create.methods', FALLBACK_METHODS);
  const tips = useUiConfig<CreateTipOption[]>('create.tips', FALLBACK_TIPS);

  useFocusEffect(
    useCallback(() => {
      void loadRecentDrafts();
    }, [loadRecentDrafts]),
  );

  const go = (mode: EditorMode) => {
    const size = sizes[Math.min(sizeIdx, sizes.length - 1)] || FALLBACK_SIZES[0];
    navigation.navigate('Editor', { mode, cols: size.cols, rows: size.rows });
  };

  // 草稿点开 → 编辑器恢复（带 designId 让保存走 update）
  const resumeDraft = useCallback((item: DesignItem) => {
    const grid = parseDesignGrid(item.designData);
    const cols = grid?.[0]?.length || 16;
    const rows = grid?.length || 16;
    navigation.navigate('Editor', {
      mode: 'manual',
      cols, rows,
      initialGrid: grid || undefined,
      designId: item.id,
    });
  }, [navigation]);

  const goAllDrafts = () => {
    // 直接打开 Profile → 我的草稿子页（initialAction 由 ProfileScreen 路由参数处理）
    navigation.navigate('Main' as any, {
      screen: 'Profile',
      params: { initialAction: 'myDrafts' },
    } as any);
  };

  const draftCardW = useMemo(() => Math.floor(W * 0.32), []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.header, { backgroundColor: colors.accent }]}>
        <View style={$.headerRow}>
          <View style={[$.headerIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name="edit-2" size={fp(14)} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$.headerTitle}>创作工坊</Text>
            <Text style={$.headerSub}>选择尺寸和方式，开始编辑拼豆图案</Text>
          </View>
          <View style={$.headerDeco}>
            <Feather name="grid" size={fp(18)} color="#fff" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(60) + BOTTOM_SAFE_H }}>
        {/* ── 我的草稿（仅在有草稿时显示） ── */}
        {recentDrafts.length > 0 ? (
          <View style={$.draftBlock}>
            <View style={$.draftHeader}>
              <Feather name="edit-2" size={fp(13)} color={colors.gold} />
              <Text style={[$.sectionTitleInline, { color: colors.text }]}>继续创作</Text>
              <Text style={[$.draftCount, { color: colors.textHint }]}>共 {recentDrafts.length} 条</Text>
              <TouchableOpacity onPress={goAllDrafts} activeOpacity={0.7} style={$.draftMore}>
                <Text style={[$.draftMoreText, { color: colors.accent }]}>查看全部</Text>
                <Feather name="chevron-right" size={fp(12)} color={colors.accent} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={$.draftRow}
            >
              {recentDrafts.map((item) => {
                const grid = parseDesignGrid(item.designData) || ALL_PATTERNS[item.id % ALL_PATTERNS.length];
                const cols = grid[0]?.length || 1;
                const beadSize = Math.max(3, Math.floor((draftCardW - wp(16)) / cols) - 1);
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => resumeDraft(item)}
                    style={[$.draftCard, { width: draftCardW, backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={[$.draftThumb, { backgroundColor: colors.inputBg }]}>
                      <BeadGrid pixels={grid} beadSize={beadSize} gap={0.5} round />
                    </View>
                    <Text style={[$.draftTitle, { color: colors.text }]} numberOfLines={1}>{item.title || '我的创作'}</Text>
                    <Text style={[$.draftTime, { color: colors.textHint }]} numberOfLines={1}>
                      {formatRelative(item.createdAt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <Text style={[$.sectionTitle, { color: colors.text }]}>画布尺寸</Text>
        <View style={$.sizeGrid}>
          {sizes.map((size, index) => {
            const active = index === sizeIdx;
            return (
              <TouchableOpacity
                key={size.label}
                activeOpacity={0.8}
                onPress={() => setSizeIdx(index)}
                style={[$.sizeCard, {
                  width: SIZE_W,
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                }]}
              >
                <Feather name={size.icon as any} size={fp(16)} color={active ? '#fff' : colors.textHint} />
                <Text style={[$.sizeLabel, { color: active ? '#fff' : colors.text }]}>{size.label}</Text>
                <Text style={[$.sizeDesc, { color: active ? 'rgba(255,255,255,0.75)' : colors.textHint }]}>
                  {size.cols}x{size.rows} · {size.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[$.sectionTitle, { color: colors.text }]}>开始创作</Text>
        {methods.map((method) => (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.8}
            onPress={() => go(method.key)}
            style={[$.methodButton, { backgroundColor: dark ? colors.surface : '#fff', borderColor: colors.border }]}
          >
            <View style={[$.methodIcon, { backgroundColor: method.color }]}>
              <Feather name={method.icon as any} size={fp(18)} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.methodTitle, { color: colors.text }]}>{method.title}</Text>
              <Text style={[$.methodDesc, { color: colors.textHint }]}>{method.desc}</Text>
            </View>
            <View style={[$.methodArrow, { backgroundColor: `${method.color}15` }]}>
              <Feather name="arrow-right" size={fp(14)} color={method.color} />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[$.sectionTitle, { color: colors.text }]}>创作提示</Text>
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.title}
            activeOpacity={0.7}
            onPress={() => go(tip.mode)}
            style={[$.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[$.tipIcon, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : tip.bg }]}>
              <Feather name={tip.icon as any} size={fp(16)} color={colors.accent} />
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

const $ = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: PAD, paddingTop: wp(12), paddingBottom: wp(16) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIconWrap: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(8),
  },
  headerTitle: { fontSize: fp(16), fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.7)', marginTop: wp(3) },
  headerDeco: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(14),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: fp(15), fontWeight: '700', paddingHorizontal: PAD, marginTop: wp(18), marginBottom: wp(10) },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' },
  sizeCard: {
    alignItems: 'center',
    paddingVertical: wp(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: wp(10),
  },
  sizeLabel: { fontSize: fp(14), fontWeight: '700', marginTop: wp(4) },
  sizeDesc: { fontSize: fp(10), marginTop: wp(2) },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginBottom: wp(10),
    padding: wp(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  methodIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  methodTitle: { fontSize: fp(14), fontWeight: '800' },
  methodDesc: { fontSize: fp(11), marginTop: wp(4), lineHeight: fp(16) },
  methodArrow: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginBottom: wp(10),
    padding: wp(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tipIcon: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  tipTitle: { fontSize: fp(13), fontWeight: '700' },
  tipDesc: { fontSize: fp(11), marginTop: wp(4), lineHeight: fp(16) },

  // 草稿区块
  draftBlock: { marginTop: wp(14) },
  draftHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, marginBottom: wp(8), gap: wp(6),
  },
  sectionTitleInline: { fontSize: fp(15), fontWeight: '700' },
  draftCount: { fontSize: fp(11), fontWeight: '500' },
  draftMore: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  draftMoreText: { fontSize: fp(12), fontWeight: '600', marginRight: wp(2) },
  draftRow: { paddingHorizontal: PAD, gap: wp(10) },
  draftCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1, padding: wp(8),
  },
  draftThumb: {
    aspectRatio: 1, borderRadius: BorderRadius.md,
    overflow: 'hidden', marginBottom: wp(6),
    justifyContent: 'center', alignItems: 'center',
  },
  draftTitle: { fontSize: fp(12), fontWeight: '600' },
  draftTime: { fontSize: fp(10), marginTop: wp(2) },
});
