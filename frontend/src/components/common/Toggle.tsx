import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import { wp } from '../../utils/responsive';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const Toggle: React.FC<Props> = ({ value, onValueChange }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.accent : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: value ? wp(18) : 0 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  },
});
