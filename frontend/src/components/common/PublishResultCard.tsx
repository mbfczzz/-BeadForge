import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

export type PublishResultVariant = 'save' | 'draft' | 'feed' | 'pattern';

export interface PublishResultCardData {
  variant: PublishResultVariant;
  /** 作品标题 / 资源标题 */
  title: string;
  /** 像素列数 × 行数 */
  cols: number;
  rows: number;
  /** 用了多少颗非透明豆 */
  beadCount: number;
  /** 用了多少种颜色 */
  colorCount: number;
}

interface Props {
  data: PublishResultCardData | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 可选次要操作（"去查看"），点了之后调用 + 关闭卡片 */
  onAction?: () => void;
  /** 自动关闭毫秒数（默认 3000；传 0 表示不自动关闭） */
  autoDismissMs?: number;
}

const VARIANT_CONFIG: Record<PublishResultVariant, {
  icon: keyof typeof Feather.glyphMap;
  bg: string;
  fg: string;
  title: string;
  hint: string;
  actionLabel: string;
}> = {
  save: {
    icon: 'check',
    bg: '#2BBF88',  // success 绿
    fg: '#FFFFFF',
    title: '已保存到我的作品',
    hint: '可在「我的 → 我的作品」继续编辑或发布',
    actionLabel: '去我的作品',
  },
  draft: {
    icon: 'edit-2',
    bg: '#F5B545',  // gold 偏向"未完成"语义
    fg: '#FFFFFF',
    title: '已保存为草稿',
    hint: '随时可在「我的 → 我的作品 → 草稿」继续编辑',
    actionLabel: '去我的草稿',
  },
  feed: {
    icon: 'send',
    bg: '#4A90FF',  // accent 蓝
    fg: '#FFFFFF',
    title: '已发布到动态',
    hint: '关注你的好友能在动态首页看到这张图',
    actionLabel: '去动态查看',
  },
  pattern: {
    icon: 'gift',
    bg: '#A78BFA',  // 紫
    fg: '#FFFFFF',
    title: '已发布到发现页',
    hint: '其他用户能浏览、收藏并下载这份图纸',
    actionLabel: '去发现页',
  },
};

export const PublishResultCard: React.FC<Props> = ({
  data,
  onClose,
  onAction,
  autoDismissMs = 3000,
}) => {
  const { colors, dark } = useTheme();
  const visible = !!data;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    progress.value = 0;
    progress.value = withSpring(1, { damping: 15, stiffness: 180, mass: 0.8 });

    if (autoDismissMs > 0) {
      const t = setTimeout(() => onClose(), autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [visible, autoDismissMs, onClose, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 40 },
    ],
  }));

  const dismiss = () => {
    progress.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  if (!data) return null;
  const cfg = VARIANT_CONFIG[data.variant];

  return (
    <View style={$.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          $.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...shadow(8, 22, dark ? 0.4 : 0.18, '#000', 8),
          },
          animatedStyle,
        ]}
      >
        {/* 顶部图标 */}
        <View style={[$.iconCircle, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon} size={fp(22)} color={cfg.fg} />
        </View>

        {/* 主标题 */}
        <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>
          {cfg.title}
        </Text>

        {/* 作品名 */}
        <Text style={[$.workTitle, { color: colors.textSecondary }]} numberOfLines={1}>
          「{data.title || '未命名作品'}」
        </Text>

        {/* 统计 chips */}
        <View style={$.statsRow}>
          <Stat icon="grid" label={`${data.cols}×${data.rows}`} colors={colors} />
          <View style={[$.dot, { backgroundColor: colors.divider }]} />
          <Stat icon="circle" label={`${data.beadCount} 颗豆`} colors={colors} />
          <View style={[$.dot, { backgroundColor: colors.divider }]} />
          <Stat icon="droplet" label={`${data.colorCount} 色`} colors={colors} />
        </View>

        {/* 提示文案 */}
        <Text style={[$.hint, { color: colors.textHint }]}>{cfg.hint}</Text>

        {/* 按钮区 */}
        <View style={$.btnRow}>
          {onAction ? (
            <Pressable
              onPress={() => { onAction(); dismiss(); }}
              style={({ pressed }) => [
                $.actionBtn,
                { backgroundColor: cfg.bg, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[$.actionText, { color: cfg.fg }]}>{cfg.actionLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={dismiss}
            style={({ pressed }) => [
              $.dismissBtn,
              { backgroundColor: colors.inputBg, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[$.dismissText, { color: colors.text }]}>继续创作</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

const Stat: React.FC<{ icon: keyof typeof Feather.glyphMap; label: string; colors: any }> = ({
  icon,
  label,
  colors,
}) => (
  <View style={$.stat}>
    <Feather name={icon} size={fp(11)} color={colors.textHint} />
    <Text style={[$.statText, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const $ = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: wp(16),
    paddingBottom: wp(28),
    zIndex: 999,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: wp(20),
    paddingTop: wp(22),
    paddingBottom: wp(16),
    alignItems: 'center',
  },
  iconCircle: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(12),
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: wp(4),
  },
  workTitle: {
    fontSize: FontSize.sm,
    marginBottom: wp(10),
    maxWidth: '92%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(8),
    gap: wp(8),
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  statText: {
    fontSize: fp(11),
    fontWeight: '500',
  },
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
  },
  hint: {
    fontSize: fp(11),
    textAlign: 'center',
    marginBottom: wp(14),
    paddingHorizontal: wp(8),
  },
  btnRow: {
    flexDirection: 'row',
    gap: wp(8),
    width: '100%',
  },
  actionBtn: {
    flex: 1.4,
    height: wp(40),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  dismissBtn: {
    flex: 1,
    height: wp(40),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
