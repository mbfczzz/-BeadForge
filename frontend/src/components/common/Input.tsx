import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontSize, BorderRadius, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';

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
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = error
    ? colors.error
    : (borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.accent],
      }) as any);

  return (
    <View style={S.wrap}>
      {label && <Text style={[S.label, { color: focused ? colors.accent : colors.textSecondary }]}>{label}</Text>}
      <Animated.View style={[S.box, { backgroundColor: colors.inputBg, borderColor }]}>
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
      </Animated.View>
      {error && <Text style={[S.err, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const S = StyleSheet.create({
  wrap: { marginBottom: wp(14) },
  label: { fontSize: fp(12), marginBottom: wp(6), fontWeight: '600' },
  box: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: wp(12), borderWidth: 1.5,
  },
  input: { flex: 1, height: wp(48), paddingHorizontal: wp(14), fontSize: fp(15) },
  eye: { paddingHorizontal: wp(14) },
  eyeT: { fontSize: fp(12), fontWeight: '500' },
  err: { fontSize: fp(11), marginTop: wp(4), fontWeight: '500' },
});
