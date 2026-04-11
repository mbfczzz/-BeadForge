import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const login = useAuthStore((s) => s.login);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = '请输入用户名';
    if (!password) e.password = '请输入密码';
    else if (password.length < 6) e.password = '密码至少6位';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (e: any) {
      Alert.alert('登录失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🧩</Text>
          </View>
          <Text style={styles.appName}>BeadForge</Text>
          <Text style={styles.slogan}>创造你的拼豆世界</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }}
            error={errors.username}
          />
          <Input
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
            secureTextEntry
            error={errors.password}
          />
          <Button title="登 录" onPress={handleLogin} loading={loading} style={styles.btn} />
          <Button title="没有账号？立即注册" onPress={onSwitchToRegister} variant="text" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: FontSize.title, fontWeight: '700', color: Colors.black },
  slogan: { fontSize: FontSize.md, color: Colors.gray, marginTop: Spacing.xs },
  form: { gap: Spacing.xs },
  btn: { marginTop: Spacing.sm },
});
