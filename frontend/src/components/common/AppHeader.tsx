import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<Props> = ({ title, onBack, right, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, style]}>
      {onBack ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      <View style={styles.rightWrap}>{right || <View style={styles.placeholder} />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: wp(52),
    paddingHorizontal: wp(16),
  },
  iconButton: {
    width: wp(36),
    height: wp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: wp(36),
    height: wp(36),
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(12),
  },
  title: {
    fontSize: fp(16),
    fontWeight: '800',
    textAlign: 'center',
  },
  rightWrap: {
    minWidth: wp(36),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
