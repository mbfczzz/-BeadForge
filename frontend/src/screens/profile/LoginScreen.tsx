import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from '../../components/common';
import { Spacing, FontSize, useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onSwitchToRegister: () => void; }

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const login = useAuthStore((s) => s.login);

  const validate = () => {
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
    try { await login({ username: username.trim(), password }); }
    catch (e: any) { Alert.alert('登录失败', e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.logo, { color: colors.accent }]}>🧩</Text>
        <Text style={[styles.title, { color: colors.text }]}>登录 BeadForge</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>登录后即可创作和分享拼豆作品</Text>

        <View style={styles.form}>
          <Input label="用户名" placeholder="请输入用户名" value={username}
            onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }} error={errors.username} />
          <Input label="密码" placeholder="请输入密码" value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }} secureTextEntry error={errors.password} />
          <Button title="登录" onPress={handleLogin} loading={loading} style={{ marginTop: Spacing.sm }} />
          <Button title="没有账号？注册" onPress={onSwitchToRegister} variant="text" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', marginTop: 6, marginBottom: Spacing.xl },
  form: {},
});
