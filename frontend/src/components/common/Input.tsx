import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontSize, useTheme } from '../../theme';
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
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inputBg, colors.surface],
  });

  const shadowOp = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });

  return (
    <View style={S.wrap}>
      {label && (
        <Text style={[S.label, { color: focused ? colors.accent : colors.textSecondary }]}>{label}</Text>
      )}
      <Animated.View style={[
        S.box,
        { backgroundColor: bgColor, shadowOpacity: shadowOp, shadowColor: colors.accent },
        error && { shadowColor: colors.error, shadowOpacity: 0.15 },
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
      </Animated.View>
      {error && <Text style={[S.err, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const S = StyleSheet.create({
  wrap: { marginBottom: wp(16) },
  label: { fontSize: fp(12), marginBottom: wp(8), fontWeight: '600' },
  box: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: wp(14),
    // 无边框，用阴影替代
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
  },
  input: { flex: 1, height: wp(50), paddingHorizontal: wp(16), fontSize: fp(15) },
  eye: { paddingHorizontal: wp(14) },
  eyeT: { fontSize: fp(12), fontWeight: '500' },
  err: { fontSize: fp(11), marginTop: wp(6), fontWeight: '500' },
});
