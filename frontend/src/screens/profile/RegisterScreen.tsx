import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请填写必填项');
      return;
    }
    if (password !== confirmPwd) {
      Alert.alert('提示', '两次密码不一致');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }
    setLoading(true);
    try {
      await register({ username: username.trim(), password, nickname: nickname.trim() || undefined });
    } catch (e: any) {
      Alert.alert('注册失败', e.message || '请稍后再试');
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
        <Text style={styles.title}>创建账号</Text>
        <Text style={styles.subtitle}>加入 BeadForge，开始拼豆创作之旅</Text>

        <View style={styles.form}>
          <Input label="用户名" placeholder="3-20个字符" value={username} onChangeText={setUsername} />
          <Input label="昵称（选填）" placeholder="给自己起个名字" value={nickname} onChangeText={setNickname} />
          <Input label="密码" placeholder="至少6位" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="确认密码" placeholder="再输入一次密码" value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry />
          <Button title="注 册" onPress={handleRegister} loading={loading} style={styles.btn} />
          <Button title="已有账号？返回登录" onPress={onSwitchToLogin} variant="text" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.gray,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.xs,
  },
  btn: {
    marginTop: Spacing.sm,
  },
});
