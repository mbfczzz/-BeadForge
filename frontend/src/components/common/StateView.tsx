import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { useTheme, candyShadow } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { BeadBuddy, type BuddyMood } from './BeadBuddy';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  /** 覆盖吉祥物心情；默认 loading=sparkle、error=cry、empty=sleep */
  mood?: BuddyMood;
}

/**
 * 糖果风 StateView — 用 BeadBuddy 吉祥物替代 emoji。
 * loading: 闪亮眼 + 脉冲缩放
 * error:   难过脸 + 重试按钮
 * empty:   打瞌睡脸
 */
export const StateView: React.FC<Props> = ({ loading, error, empty, emptyText = '暂无内容', onRetry, mood }) => {
  const { colors, dark } = useTheme();
  const buddyColor = dark ? colors.candy.peach : colors.candy.pink;

  if (loading) return (
    <View style={$.c}>
      <MotiView
        from={{ scale: 0.9 }}
        animate={{ scale: 1.05 }}
        transition={{ type: 'timing', duration: 700, loop: true, repeatReverse: true }}
      >
        <BeadBuddy size={wp(80)} color={buddyColor} mood={mood ?? 'sparkle'} />
      </MotiView>
      <Text style={[$.hint, { color: colors.textHint }]}>加载中...</Text>
    </View>
  );
  if (error) return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={$.c}
    >
      <BeadBuddy size={wp(90)} color={dark ? colors.candy.lavender : colors.candy.sky} mood={mood ?? 'cry'} />
      <Text style={[$.msg, { color: colors.textSecondary }]}>{error}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[$.btn, { backgroundColor: colors.accent }, candyShadow(colors.accent, 'md')]}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Text style={$.btnT}>再试一次</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
  if (empty) return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 14 }}
      style={$.c}
    >
      <BeadBuddy size={wp(80)} color={buddyColor} mood={mood ?? 'sleep'} />
      <Text style={[$.msg, { color: colors.textHint }]}>{emptyText}</Text>
    </MotiView>
  );
  return null;
};

const $ = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(48), paddingHorizontal: wp(24) },
  msg: { fontSize: fp(14), textAlign: 'center', lineHeight: fp(20), marginTop: wp(12), letterSpacing: 0.2 },
  hint: { fontSize: fp(12), marginTop: wp(10), letterSpacing: 0.3 },
  btn: { marginTop: wp(18), paddingHorizontal: wp(28), paddingVertical: wp(11), borderRadius: wp(9999) },
  btnT: { color: '#FFF', fontSize: fp(14), fontWeight: '700', letterSpacing: 0.3 },
});
