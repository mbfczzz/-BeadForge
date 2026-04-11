import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
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
      Alert.alert('😵 登录失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 吉祥物区域 */}
        <View style={styles.mascotWrap}>
          <View style={styles.mascotCircle}>
            <Text style={styles.mascotEmoji}>🧩</Text>
          </View>
        </View>

        <Text style={styles.title}>欢迎回来！</Text>
        <Text style={styles.subtitle}>登录继续你的拼豆之旅</Text>

        <View style={styles.form}>
          <Input
            label="用户名"
            placeholder="输入你的用户名"
            value={username}
            onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }}
            error={errors.username}
          />
          <Input
            label="密码"
            placeholder="输入密码"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
            secureTextEntry
            error={errors.password}
          />

          <View style={styles.btnGroup}>
            <Button title="登 录" onPress={handleLogin} loading={loading} />
            <View style={{ height: 12 }} />
            <Button title="创建新账号" onPress={onSwitchToRegister} variant="outline" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  mascotWrap: { alignItems: 'center', marginBottom: Spacing.lg },
  mascotCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    borderWidth: 4, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  mascotEmoji: { fontSize: 48 },
  title: {
    fontSize: FontSize.title, fontWeight: '800', color: Colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.gray,
    textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.xl,
  },
  form: {},
  btnGroup: { marginTop: Spacing.md },
});
