import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onSwitchToRegister: () => void }

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { colors, dark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!username.trim()) { Alert.alert('提示', '请输入用户名'); return; }
    if (password.length < 6) { Alert.alert('提示', '密码至少6位'); return; }
    setLoading(true);
    try { await login({ username: username.trim(), password }); }
    catch (e: any) { Alert.alert('登录失败', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: wp(24) }}>

          {/* Logo */}
          <View style={$.logoRow}>
            <View style={[$.logoBox, { backgroundColor: colors.accent }]}>
              <Text style={$.logoEmoji}>🧩</Text>
            </View>
            <View style={{ marginLeft: wp(12) }}>
              <Text style={[$.brand, { color: colors.text }]}>BeadForge</Text>
              <Text style={[$.sub, { color: colors.textHint }]}>拼豆创作平台</Text>
            </View>
          </View>

          <Text style={[$.welcome, { color: colors.text }]}>欢迎回来</Text>
          <Text style={[$.welcomeSub, { color: colors.textHint }]}>登录后即可创作和分享拼豆作品</Text>

          {/* 用户名 */}
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

          {/* 密码 */}
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
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.6}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
            style={[$.loginBtn, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
          >
            <Text style={$.loginBtnT}>{loading ? '登录中...' : '登录'}</Text>
          </TouchableOpacity>

          {/* 注册入口 */}
          <View style={$.bottomRow}>
            <Text style={[$.bottomText, { color: colors.textHint }]}>还没有账号？</Text>
            <TouchableOpacity onPress={onSwitchToRegister} activeOpacity={0.6}>
              <Text style={[$.bottomLink, { color: colors.accent }]}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },

  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: wp(32) },
  logoBox: {
    width: wp(48), height: wp(48), borderRadius: wp(14),
    justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: fp(24) },
  brand: { fontSize: fp(22), fontWeight: '800' },
  sub: { fontSize: fp(12), marginTop: wp(2) },

  welcome: { fontSize: fp(20), fontWeight: '700', marginBottom: wp(4) },
  welcomeSub: { fontSize: fp(13), marginBottom: wp(20), lineHeight: fp(19) },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(48), borderRadius: wp(12), borderWidth: 1,
    paddingHorizontal: wp(14), marginBottom: wp(12),
  },
  input: { flex: 1, fontSize: fp(15), marginLeft: wp(10), padding: 0 },

  loginBtn: {
    height: wp(48), borderRadius: wp(12),
    justifyContent: 'center', alignItems: 'center',
    marginTop: wp(6),
  },
  loginBtnT: { color: '#fff', fontSize: fp(16), fontWeight: '700' },

  bottomRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: wp(20),
  },
  bottomText: { fontSize: fp(13) },
  bottomLink: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(4) },
});
