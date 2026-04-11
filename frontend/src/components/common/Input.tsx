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

export const Input: React.FC<Props> = ({
  label, placeholder, value, onChangeText,
  secureTextEntry = false, error, keyboardType = 'default',
}) => {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, focused && styles.focused, error && styles.errBorder]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray}
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
            <Text style={styles.eyeText}>{showPwd ? '隐藏' : '显示'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.md, color: Colors.grayDark, marginBottom: 6, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.grayBg, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  focused: { borderColor: Colors.black, backgroundColor: Colors.white },
  errBorder: { borderColor: Colors.error },
  input: { flex: 1, height: 48, paddingHorizontal: Spacing.md, fontSize: FontSize.lg, color: Colors.black },
  eye: { paddingHorizontal: Spacing.md },
  eyeText: { fontSize: FontSize.sm, color: Colors.gray },
  error: { color: Colors.error, fontSize: FontSize.sm, marginTop: 4 },
});
