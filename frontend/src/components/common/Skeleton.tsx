import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, useTheme } from '../../theme';
import { wp } from '../../utils/responsive';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<Props> = ({
  width = '100%', height = 16, borderRadius = BorderRadius.sm, style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[{ width: width as any, height, borderRadius, backgroundColor: colors.skeleton, opacity }, style]} />
  );
};

export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 180 }) => {
  const { colors } = useTheme();
  return (
    <View style={[sk.card, { backgroundColor: colors.cardBg }]}>
      <Skeleton width="100%" height={height} borderRadius={0} />
      <View style={sk.info}>
        <Skeleton width="65%" height={wp(13)} />
        <Skeleton width="45%" height={wp(10)} style={{ marginTop: wp(8) }} />
        <View style={sk.row}>
          <Skeleton width={wp(44)} height={wp(10)} />
          <Skeleton width={wp(28)} height={wp(10)} />
        </View>
      </View>
    </View>
  );
};

const sk = StyleSheet.create({
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: wp(10) },
  info: { paddingHorizontal: wp(12), paddingTop: wp(10), paddingBottom: wp(12) },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(10) },
});
