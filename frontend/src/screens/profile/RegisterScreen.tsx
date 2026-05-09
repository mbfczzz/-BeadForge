import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, Input, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { colors } = useTheme();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return username.trim().length >= 3 && password.length >= 6 && password === confirmPwd;
  }, [confirmPwd, password, username]);

  const handleRegister = async () => {
    if (!username.trim() || username.trim().length < 3) {
      Alert.alert('提示', '用户名至少需要 3 个字符');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码至少需要 6 位');
      return;
    }

    if (password !== confirmPwd) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        nickname: nickname.trim() || undefined,
      });
    } catch (error: any) {
      Alert.alert('注册失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={$.root} behavior="padding">
        <ScrollView
          contentContainerStyle={$.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={$.hero}>
            <Text style={[$.title, { color: colors.text }]}>创建本地账号</Text>
            <Text style={[$.subtitle, { color: colors.textHint }]}>注册后会直接进入当前 mock 测试环境，并沿用新的表单与卡片视觉风格。</Text>
          </View>

          <SurfaceCard title="填写账号信息" description="建议先输入用户名和密码，昵称可以稍后在资料页补充。">
            <Input
              label="用户名"
              placeholder="至少 3 个字符"
              value={username}
              onChangeText={setUsername}
              prefix={<Feather name="user" size={fp(16)} color={colors.textHint} />}
            />
            <Input
              label="昵称"
              placeholder="选填"
              value={nickname}
              onChangeText={setNickname}
              prefix={<Feather name="edit-3" size={fp(16)} color={colors.textHint} />}
            />
            <Input
              label="密码"
              placeholder="至少 6 位"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              prefix={<Feather name="lock" size={fp(16)} color={colors.textHint} />}
            />
            <Input
              label="确认密码"
              placeholder="再次输入密码"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              secureTextEntry
              prefix={<Feather name="shield" size={fp(16)} color={colors.textHint} />}
              error={confirmPwd.length > 0 && password !== confirmPwd ? '两次输入的密码不一致' : undefined}
            />

            <Button title={loading ? '注册中...' : '注册'} onPress={handleRegister} loading={loading} disabled={!canSubmit} />

            <View style={$.footerRow}>
              <Text style={[$.footerText, { color: colors.textHint }]}>已经有账号？</Text>
              <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
                <Text style={[$.footerLink, { color: colors.accent }]}>返回登录</Text>
              </TouchableOpacity>
            </View>
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(24),
    paddingVertical: wp(24),
  },
  hero: {
    marginBottom: wp(20),
  },
  title: {
    fontSize: fp(28),
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fp(13),
    lineHeight: fp(20),
    marginTop: wp(8),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: wp(6),
  },
  footerText: {
    fontSize: fp(13),
  },
  footerLink: {
    fontSize: fp(13),
    fontWeight: '700',
    marginLeft: wp(4),
  },
});
