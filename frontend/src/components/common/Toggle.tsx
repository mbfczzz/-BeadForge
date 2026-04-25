import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { wp } from '../../utils/responsive';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const Toggle: React.FC<Props> = ({ value, onValueChange }) => {
  const { colors } = useTheme();
  const thumbTravel = wp(18);
  const progress = useSharedValue(value ? 1 : 0);
  const thumbX = useSharedValue(value ? thumbTravel : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
    thumbX.value = withSpring(value ? thumbTravel : 0, {
      damping: 16,
      stiffness: 220,
      mass: 0.7,
    });
  }, [progress, thumbTravel, thumbX, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.accent],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: thumbX.value,
      },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={styles.pressable}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    padding: wp(2),
  },
  track: {
    width: wp(42),
    height: wp(24),
    borderRadius: wp(999),
    paddingHorizontal: wp(2),
    justifyContent: 'center',
  },
  thumb: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
