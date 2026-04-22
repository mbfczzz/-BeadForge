import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

/** loading 态：吉祥物呼吸脉冲（scale 0.9 ↔ 1.05 循环） */
const Pulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
};

/** error/empty 态：从下 10px 淡入 */
const FadeInUp: React.FC<{ children: React.ReactNode; spring?: boolean }> = ({ children, spring }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(spring ? 0.9 : 1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      spring
        ? Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 14 })
        : Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      spring
        ? Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14 })
        : Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, scale, spring]);
  return <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>{children}</Animated.View>;
};

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
      <Pulse>
        <BeadBuddy size={wp(80)} color={buddyColor} mood={mood ?? 'sparkle'} />
      </Pulse>
      <Text style={[$.hint, { color: colors.textHint }]}>加载中...</Text>
    </View>
  );
  if (error) return (
    <View style={$.c}>
      <FadeInUp>
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
      </FadeInUp>
    </View>
  );
  if (empty) return (
    <View style={$.c}>
      <FadeInUp spring>
        <BeadBuddy size={wp(80)} color={buddyColor} mood={mood ?? 'sleep'} />
        <Text style={[$.msg, { color: colors.textHint }]}>{emptyText}</Text>
      </FadeInUp>
    </View>
  );
  return null;
};

const $ = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(48), paddingHorizontal: wp(24) },
  msg: { fontSize: fp(14), textAlign: 'center', lineHeight: fp(20), marginTop: wp(12), letterSpacing: 0.2 },
  hint: { fontSize: fp(12), marginTop: wp(10), letterSpacing: 0.3 },
  btn: { marginTop: wp(18), paddingHorizontal: wp(28), paddingVertical: wp(11), borderRadius: wp(9999), alignSelf: 'center' },
  btnT: { color: '#FFF', fontSize: fp(14), fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
});
