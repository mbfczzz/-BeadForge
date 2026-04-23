import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, FontSize, candyShadow } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { BeadBuddy } from '../../components/common/BeadBuddy';

interface Props { onSwitchToRegister: () => void }

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { colors, dark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState<'u' | 'p' | null>(null);
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

  const gradient = dark
    ? ['#3D1F32', '#2A1A28', '#1A1220'] as const
    : ['#FFE0EB', '#FFF0E5', '#F0E5FF'] as const;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      {/* 背景糖果渐变 */}
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: wp(28), paddingVertical: wp(32) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部吉祥物 */}
          <View style={$.buddyWrap}>
            <BeadBuddy size={wp(110)} color={colors.candy.pink} mood="happy" />
          </View>

          {/* 欢迎标题 */}
          <Text style={[$.welcome, { color: colors.text }]}>
            欢迎回来<Text style={{ color: colors.accent }}>！</Text>
          </Text>
          <Text style={[$.welcomeSub, { color: colors.textSecondary }]}>
            登录就能开始<Text style={{ color: colors.candy.mango, fontWeight: '700' }}>创作</Text>和<Text style={{ color: colors.candy.grape, fontWeight: '700' }}>分享</Text>啦 ✨
          </Text>

          {/* 用户名 */}
          <View
            style={[
              $.inputBox,
              { backgroundColor: colors.surface, borderColor: focused === 'u' ? colors.accent : colors.border },
              focused === 'u' && candyShadow(colors.accent, 'sm'),
            ]}
          >
            <Feather name="user" size={fp(16)} color={focused === 'u' ? colors.accent : colors.textHint} />
            <TextInput
              style={[$.input, { color: colors.text }]}
              placeholder="用户名"
              placeholderTextColor={colors.textHint}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocused('u')}
              onBlur={() => setFocused(null)}
              autoCapitalize="none"
            />
          </View>

          {/* 密码 */}
          <View
            style={[
              $.inputBox,
              { backgroundColor: colors.surface, borderColor: focused === 'p' ? colors.accent : colors.border },
              focused === 'p' && candyShadow(colors.accent, 'sm'),
            ]}
          >
            <Feather name="lock" size={fp(16)} color={focused === 'p' ? colors.accent : colors.textHint} />
            <TextInput
              style={[$.input, { color: colors.text }]}
              placeholder="密码"
              placeholderTextColor={colors.textHint}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('p')}
              onBlur={() => setFocused(null)}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.6} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
            style={[
              $.loginBtn,
              { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 },
              candyShadow(colors.accent, 'md'),
            ]}
          >
            <Text style={$.loginBtnT}>{loading ? '登录中...' : '登 录'}</Text>
          </TouchableOpacity>

          {/* 注册入口 */}
          <View style={$.bottomRow}>
            <Text style={[$.bottomText, { color: colors.textHint }]}>还没有账号？</Text>
            <TouchableOpacity onPress={onSwitchToRegister} activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[$.bottomLink, { color: colors.accent }]}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },

  buddyWrap: { alignItems: 'center', marginBottom: wp(18) },

  welcome: { fontSize: fp(26), fontWeight: '800', textAlign: 'center', marginBottom: wp(6), letterSpacing: 0.3 },
  welcomeSub: { fontSize: fp(13), textAlign: 'center', marginBottom: wp(28), lineHeight: fp(20), letterSpacing: 0.2 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(52), borderRadius: wp(9999), borderWidth: 1.5,
    paddingHorizontal: wp(18), marginBottom: wp(14),
  },
  input: { flex: 1, fontSize: FontSize.lg, marginLeft: wp(10), padding: 0 },

  loginBtn: {
    height: wp(52), borderRadius: wp(9999),
    justifyContent: 'center', alignItems: 'center',
    marginTop: wp(10),
  },
  loginBtnT: { color: '#fff', fontSize: fp(16), fontWeight: '800', letterSpacing: 2 },

  bottomRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: wp(24),
  },
  bottomText: { fontSize: fp(13) },
  bottomLink: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(4) },
});
