import React, { useMemo, useState } from 'react';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input: React.FC<Props> = ({
  label,
  error,
  containerStyle,
  style,
  prefix,
  suffix,
  secureTextEntry = false,
  autoCapitalize = 'none',
  ...props
}) => {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(false);

  const resolvedSuffix = useMemo(() => {
    if (suffix) return suffix;
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity onPress={() => setRevealed((value) => !value)} activeOpacity={0.7}>
        <Text style={[styles.toggle, { color: colors.accent }]}>{revealed ? '隐藏' : '显示'}</Text>
      </TouchableOpacity>
    );
  }, [colors.accent, revealed, secureTextEntry, suffix]);

  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.error : colors.border,
          },
          containerStyle,
          style as StyleProp<ViewStyle>,
        ]}
      >
        {prefix ? <View style={styles.decorator}>{prefix}</View> : null}
        <TextInput
          {...props}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !revealed}
          placeholderTextColor={colors.textHint}
          selectionColor={colors.accent}
          style={[styles.input, { color: colors.text }, style]}
        />
        {resolvedSuffix ? <View style={styles.decorator}>{resolvedSuffix}</View> : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldWrap: {
    gap: wp(6),
  },
  label: {
    fontSize: fp(12),
    fontWeight: '600',
  },
  inputRow: {
    minHeight: wp(48),
    borderWidth: 1,
    borderRadius: wp(16),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: wp(48),
    fontSize: fp(15),
    paddingVertical: 0,
    paddingHorizontal: wp(14),
  },
  decorator: {
    paddingHorizontal: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  error: {
    fontSize: fp(11),
    lineHeight: fp(16),
  },
});
