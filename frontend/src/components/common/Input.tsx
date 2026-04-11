import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontSize, BorderRadius, Spacing, useTheme } from '../../theme';

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

  const borderColor = error ? colors.error : focused ? colors.accent : 'transparent';

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
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
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eye}>
            <Text style={{ fontSize: FontSize.sm, color: colors.textHint }}>{showPwd ? '隐藏' : '显示'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, marginBottom: 6, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: 1.5,
  },
  input: { flex: 1, height: 46, paddingHorizontal: Spacing.md, fontSize: FontSize.md },
  eye: { paddingHorizontal: Spacing.md },
  error: { fontSize: FontSize.sm, marginTop: 4 },
});
