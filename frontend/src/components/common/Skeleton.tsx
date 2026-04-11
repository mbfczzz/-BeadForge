import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, useTheme } from '../../theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * 骨架屏加载占位 - 呼吸闪烁动画
 */
export const Skeleton: React.FC<Props> = ({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

/** 卡片骨架屏 */
export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 180 }) => {
  const { colors } = useTheme();
  return (
    <View style={[skStyles.card, { backgroundColor: colors.cardBg }]}>
      <Skeleton width="100%" height={height} borderRadius={0} />
      <View style={skStyles.info}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={10} style={{ marginTop: 8 }} />
        <View style={skStyles.row}>
          <Skeleton width={50} height={10} />
          <Skeleton width={30} height={10} />
        </View>
      </View>
    </View>
  );
};

const skStyles = StyleSheet.create({
  card: { borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: 8 },
  info: { padding: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
