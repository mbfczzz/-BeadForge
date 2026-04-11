import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, BorderRadius, Spacing } from '../../theme';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

/**
 * 多邻国风格输入框 - 粗圆角边框 + 聚焦高亮
 */
export const Input: React.FC<Props> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? Colors.red
    : focused
    ? Colors.blue
    : Colors.grayBg;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, { borderColor, borderBottomColor: error ? Colors.redDark : focused ? Colors.blueDark : Colors.shadowGray }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.grayLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.black,
    fontWeight: '600',
  },
  eye: {
    paddingHorizontal: Spacing.md,
  },
  eyeText: {
    fontSize: 20,
  },
  error: {
    color: Colors.red,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
});
