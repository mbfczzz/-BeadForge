import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { shadow } from '../../utils/shadow';

interface ProfileCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ children, style }) => {
  const { colors, dark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? colors.surface : '#FFFFFF',
          borderColor: dark ? colors.border : 'rgba(107, 142, 195, 0.14)',
        },
        shadow(12, 28, dark ? 0.24 : 0.12, '#1D4ED8', 10),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
  },
});
