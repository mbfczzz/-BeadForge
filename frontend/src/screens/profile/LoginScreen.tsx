import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

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
        <View style={[$.content, { backgroundColor: colors.bg }]}>
          <View style={$.brandRow}>
            <View style={[$.brandIcon, { backgroundColor: colors.accent }]}>
              <Feather name="grid" size={fp(18)} color="#fff" />
            </View>
            <View style={$.brandText}>
              <Text style={[$.brandName, { color: colors.text }]}>BeadForge</Text>
              <Text style={[$.brandSub, { color: colors.textHint }]}>本地测试环境</Text>
            </View>
          </View>

          <Text style={[$.title, { color: colors.text }]}>登录</Text>
          <Text style={[$.subtitle, { color: colors.textHint }]}>
            当前版本使用本地 mock 用户和 mock 数据进行演示。
          </Text>

          <View style={[$.testCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={$.testInfo}>
              <Text style={[$.testTitle, { color: colors.text }]}>测试账号</Text>
              <Text style={[$.testValue, { color: colors.textHint }]}>
                用户名：{TEST_LOGIN_CREDENTIALS.username}
              </Text>
              <Text style={[$.testValue, { color: colors.textHint }]}>
                密码：{TEST_LOGIN_CREDENTIALS.password}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setUsername(TEST_LOGIN_CREDENTIALS.username);
                setPassword(TEST_LOGIN_CREDENTIALS.password);
              }}
              activeOpacity={0.75}
              style={[$.testButton, { backgroundColor: colors.accentLight }]}
            >
              <Text style={[$.testButtonText, { color: colors.accent }]}>填充</Text>
            </TouchableOpacity>
          </View>

          <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="user" size={fp(16)} color={colors.textHint} />
            <TextInput
              style={[$.input, { color: colors.text }]}
              placeholder="用户名"
              placeholderTextColor={colors.textHint}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="lock" size={fp(16)} color={colors.textHint} />
            <TextInput
              style={[$.input, { color: colors.text }]}
              placeholder="密码"
              placeholderTextColor={colors.textHint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd((value) => !value)} activeOpacity={0.6}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
            style={[$.submit, { backgroundColor: colors.accent, opacity: loading ? 0.65 : 1 }]}
          >
            <Text style={$.submitText}>{loading ? '登录中...' : '登录'}</Text>
          </TouchableOpacity>

          <View style={$.footerRow}>
            <Text style={[$.footerText, { color: colors.textHint }]}>还没有账号？</Text>
            <TouchableOpacity onPress={onSwitchToRegister} activeOpacity={0.6}>
              <Text style={[$.footerLink, { color: colors.accent }]}>创建本地账号</Text>
            </TouchableOpacity>
          </View>
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
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(32),
  },
  brandIcon: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    marginLeft: wp(12),
  },
  brandName: {
    fontSize: fp(22),
    fontWeight: '800',
  },
  brandSub: {
    fontSize: fp(12),
    marginTop: wp(2),
  },
  title: {
    fontSize: fp(20),
    fontWeight: '700',
    marginBottom: wp(4),
  },
  subtitle: {
    fontSize: fp(13),
    marginBottom: wp(20),
    lineHeight: fp(19),
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: wp(14),
    paddingHorizontal: wp(14),
    paddingVertical: wp(12),
    marginBottom: wp(14),
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: fp(13),
    fontWeight: '700',
    marginBottom: wp(4),
  },
  testValue: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  testButton: {
    paddingHorizontal: wp(12),
    paddingVertical: wp(8),
    borderRadius: wp(10),
    marginLeft: wp(12),
  },
  testButtonText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(48),
    borderRadius: wp(12),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    marginBottom: wp(12),
  },
  input: {
    flex: 1,
    fontSize: fp(15),
    marginLeft: wp(10),
    padding: 0,
  },
  submit: {
    height: wp(48),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp(6),
  },
  submitText: {
    color: '#fff',
    fontSize: fp(16),
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: wp(20),
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
