import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  divider?: boolean;
  tone?: 'accent' | 'neutral' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export const ListRow: React.FC<Props> = ({
  icon,
  label,
  description,
  value,
  right,
  onPress,
  showChevron = !!onPress,
  divider = false,
  tone = 'accent',
  style,
}) => {
  const { colors } = useTheme();

  const iconPalette = {
    accent: { bg: colors.accentLight, fg: colors.accent },
    neutral: { bg: colors.inputBg, fg: colors.textSecondary },
    danger: { bg: `${colors.error}18`, fg: colors.error },
  }[tone];

  const content = (
    <>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconPalette.bg }]}>
          <Feather name={icon} size={fp(15)} color={iconPalette.fg} />
        </View>
      ) : null}

      <View style={[styles.textWrap, !icon && styles.textWrapWithoutIcon]}>
        <Text style={[styles.label, { color: tone === 'danger' ? colors.error : colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: colors.textHint }]}>{description}</Text> : null}
      </View>

      {right || value ? <View style={styles.rightWrap}>{right || <Text style={[styles.value, { color: colors.textHint }]}>{value}</Text>}</View> : null}
      {showChevron ? <Feather name="chevron-right" size={fp(15)} color={colors.textHint} /> : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }, style]}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  iconWrap: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: wp(12),
  },
  textWrapWithoutIcon: {
    marginLeft: 0,
  },
  label: {
    fontSize: fp(14),
    fontWeight: '600',
  },
  description: {
    fontSize: fp(11),
    marginTop: wp(4),
    lineHeight: fp(16),
  },
  value: {
    fontSize: fp(12),
    fontWeight: '600',
  },
  rightWrap: {
    marginLeft: wp(12),
    marginRight: wp(6),
  },
});
