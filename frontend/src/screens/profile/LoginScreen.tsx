import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { TEST_LOGIN_CREDENTIALS } from '../../mock/auth';

interface Props {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { colors } = useTheme();
  const [username, setUsername] = useState(TEST_LOGIN_CREDENTIALS.username);
  const [password, setPassword] = useState(TEST_LOGIN_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length >= 6, [password, username]);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码至少需要 6 位');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (error: any) {
      Alert.alert('登录失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={$.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={$.content}>
          <View style={$.hero}>
            <View style={[$.brandIcon, { backgroundColor: colors.accent }]}>
              <Feather name="grid" size={fp(18)} color="#fff" />
            </View>
            <Text style={[$.brandName, { color: colors.text }]}>BeadForge</Text>
          </View>

          <SurfaceCard style={$.card}>
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChangeText={setUsername}
              prefix={<Feather name="user" size={fp(16)} color={colors.textHint} />}
            />

            <Input
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              prefix={<Feather name="lock" size={fp(16)} color={colors.textHint} />}
            />

            <Button title={loading ? '登录中...' : '登录'} onPress={handleLogin} loading={loading} disabled={!canSubmit} />

            <View style={$.footerRow}>
              <Text style={[$.footerText, { color: colors.textHint }]}>还没有账号？</Text>
              <TouchableOpacity onPress={onSwitchToRegister} activeOpacity={0.7}>
                <Text style={[$.footerLink, { color: colors.accent }]}>创建本地账号</Text>
              </TouchableOpacity>
            </View>
          </SurfaceCard>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(24),
    paddingVertical: wp(20),
  },
  hero: {
    marginBottom: wp(20),
  },
  brandIcon: {
    width: wp(52),
    height: wp(52),
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(14),
  },
  brandName: {
    fontSize: fp(28),
    fontWeight: '800',
  },
  card: {
    borderRadius: wp(24),
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
