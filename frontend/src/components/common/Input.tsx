import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { FontSize, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

export const Input: React.FC<Props> = ({
  label, placeholder, value, onChangeText,
  secureTextEntry = false, error, keyboardType = 'default',
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <View style={S.wrap}>
      {label && (
        <Text style={[S.label, { color: focused ? colors.accent : colors.textSecondary }]}>{label}</Text>
      )}
      <View style={[
        S.box,
        { backgroundColor: focused ? colors.surface : colors.inputBg },
        focused && { ...shadow(0, 6, 0.1, colors.accent, 2), borderWidth: 1.5, borderColor: colors.accent + '40' },
        error && { borderColor: colors.error, borderWidth: 1.5 },
        Platform.OS === 'web' && { transitionDuration: '0.25s', transitionProperty: 'background-color, box-shadow, border-color' } as any,
      ]}>
        <TextInput
          style={[S.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textHint}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPwd}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={S.eye}>
            <Text style={[S.eyeT, { color: colors.textHint }]}>{showPwd ? '隐藏' : '显示'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[S.err, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const S = StyleSheet.create({
  wrap: { marginBottom: wp(18) },
  label: { fontSize: fp(13), marginBottom: wp(8), fontWeight: '600' },
  box: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: wp(12),
  },
  input: { flex: 1, height: wp(50), paddingHorizontal: wp(16), fontSize: fp(15) },
  eye: { paddingHorizontal: wp(14) },
  eyeT: { fontSize: fp(12), fontWeight: '500' },
  err: { fontSize: fp(11), marginTop: wp(6), fontWeight: '500' },
});
