import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
}

export const SurfaceCard: React.FC<Props> = ({
  children,
  title,
  description,
  footer,
  headerRight,
  style,
  bodyStyle,
  variant = 'secondary',
}) => {
  const { colors } = useTheme();

  const backgroundColor = variant === 'tertiary'
    ? colors.inputBg
    : variant === 'transparent'
      ? 'transparent'
      : colors.surface;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: variant === 'transparent' ? 'transparent' : colors.border,
          borderWidth: variant === 'transparent' ? 0 : 1,
        },
        style,
      ]}
    >
      {(title || description || headerRight) ? (
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
            {description ? <Text style={[styles.description, { color: colors.textHint }]}>{description}</Text> : null}
          </View>
          {headerRight}
        </View>
      ) : null}
      <View style={[styles.body, bodyStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: wp(20),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: wp(12),
    paddingHorizontal: wp(14),
    paddingTop: wp(14),
    paddingBottom: wp(8),
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: fp(16),
    fontWeight: '700',
  },
  description: {
    fontSize: fp(12),
    marginTop: wp(4),
    lineHeight: fp(18),
  },
  body: {
    gap: wp(12),
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  footer: {
    paddingHorizontal: wp(14),
    paddingBottom: wp(14),
    paddingTop: 0,
  },
});
