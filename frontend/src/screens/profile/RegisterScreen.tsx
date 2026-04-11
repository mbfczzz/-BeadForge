import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  onSwitchToLogin: () => void;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPwd?: string;
  email?: string;
}

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const register = useAuthStore((s) => s.register);

  const clearError = (field: keyof FormErrors) => setErrors((e) => ({ ...e, [field]: undefined }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!username.trim()) e.username = '请输入用户名';
    else if (username.trim().length < 3) e.username = '至少3个字符';
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = '只能包含字母、数字和下划线';
    if (!password) e.password = '请输入密码';
    else if (password.length < 6) e.password = '至少6位';
    if (password && password !== confirmPwd) e.confirmPwd = '两次密码不一致';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = '邮箱格式不对';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        username: username.trim(), password,
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
      });
    } catch (e: any) {
      Alert.alert('😵 注册失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>加入 BeadForge，开启拼豆创作之旅！</Text>
        </View>

        <Input label="用户名" placeholder="字母、数字、下划线" value={username}
          onChangeText={(t) => { setUsername(t); clearError('username'); }} error={errors.username} />
        <Input label="昵称（选填）" placeholder="给自己起个名字" value={nickname} onChangeText={setNickname} />
        <Input label="邮箱（选填）" placeholder="example@mail.com" value={email}
          onChangeText={(t) => { setEmail(t); clearError('email'); }} keyboardType="email-address" error={errors.email} />
        <Input label="密码" placeholder="至少6位" value={password}
          onChangeText={(t) => { setPassword(t); clearError('password'); }} secureTextEntry error={errors.password} />
        <Input label="确认密码" placeholder="再输入一次" value={confirmPwd}
          onChangeText={(t) => { setConfirmPwd(t); clearError('confirmPwd'); }} secureTextEntry error={errors.confirmPwd} />

        <View style={styles.btnGroup}>
          <Button title="注 册" onPress={handleRegister} loading={loading} />
          <View style={{ height: 12 }} />
          <Button title="已有账号？返回登录" onPress={onSwitchToLogin} variant="text" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flexGrow: 1, padding: Spacing.xl, paddingTop: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  headerEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.title, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.gray, marginTop: Spacing.xs, textAlign: 'center' },
  btnGroup: { marginTop: Spacing.md },
});
