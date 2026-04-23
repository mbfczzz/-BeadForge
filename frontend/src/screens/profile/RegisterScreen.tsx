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

interface Props { onSwitchToLogin: () => void }

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { colors, dark } = useTheme();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!username.trim() || username.trim().length < 3) { Alert.alert('提示', '用户名至少3个字符'); return; }
    if (password.length < 6) { Alert.alert('提示', '密码至少6位'); return; }
    if (password !== confirmPwd) { Alert.alert('提示', '两次密码不一致'); return; }
    setLoading(true);
    try {
      await register({ username: username.trim(), password, nickname: nickname.trim() || undefined });
    } catch (e: any) { Alert.alert('注册失败', e.message); }
    finally { setLoading(false); }
  };

  // 国风淡彩：天青→宣纸→朱砂淡粉
  const gradient = dark
    ? ['#2A1F1C', '#1A1413', '#3A1F1C'] as const
    : ['#E5EEF5', '#F5EFE0', '#FBE8E6'] as const;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: wp(28), paddingVertical: wp(32) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 吉祥物 */}
          <View style={$.buddyWrap}>
            <BeadBuddy size={wp(96)} color={colors.candy.lavender} mood="sparkle" />
          </View>

          {/* 标题 */}
          <Text style={[$.title, { color: colors.text }]}>
            加入 <Text style={{ color: colors.accent }}>BeadForge</Text>
          </Text>
          <Text style={[$.sub, { color: colors.textSecondary }]}>
            创建属于你的<Text style={{ color: colors.candy.mango, fontWeight: '700' }}>拼豆创作小宇宙</Text> 🎨
          </Text>

          <InputRow
            icon="user" placeholder="用户名（至少3位）"
            value={username} onChangeText={setUsername}
            colors={colors} focused={focused === 'u'} onFocus={() => setFocused('u')} onBlur={() => setFocused(null)}
          />
          <InputRow
            icon="smile" placeholder="昵称（选填）"
            value={nickname} onChangeText={setNickname}
            colors={colors} focused={focused === 'n'} onFocus={() => setFocused('n')} onBlur={() => setFocused(null)}
          />

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
              placeholder="密码（至少6位）"
              placeholderTextColor={colors.textHint}
              value={password} onChangeText={setPassword}
              onFocus={() => setFocused('p')} onBlur={() => setFocused(null)}
              secureTextEntry={!showPwd} autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.6} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          <InputRow
            icon="shield" placeholder="确认密码"
            value={confirmPwd} onChangeText={setConfirmPwd}
            colors={colors} secure={!showPwd}
            focused={focused === 'c'} onFocus={() => setFocused('c')} onBlur={() => setFocused(null)}
          />

          {/* 注册按钮 */}
          <TouchableOpacity
            activeOpacity={0.85} onPress={handleRegister} disabled={loading}
            style={[
              $.btn,
              { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 },
              candyShadow(colors.accent, 'md'),
            ]}
          >
            <Text style={$.btnT}>{loading ? '注册中...' : '注 册'}</Text>
          </TouchableOpacity>

          <View style={$.bottomRow}>
            <Text style={[$.bottomText, { color: colors.textHint }]}>已有账号？</Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[$.bottomLink, { color: colors.accent }]}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ──── 输入行 ──── */

const InputRow: React.FC<{
  icon: string; placeholder: string; value: string; onChangeText: (t: string) => void;
  colors: any; secure?: boolean; focused?: boolean;
  onFocus?: () => void; onBlur?: () => void;
}> = ({ icon, placeholder, value, onChangeText, colors, secure, focused, onFocus, onBlur }) => (
  <View
    style={[
      $.inputBox,
      { backgroundColor: colors.surface, borderColor: focused ? colors.accent : colors.border },
      focused && candyShadow(colors.accent, 'sm'),
    ]}
  >
    <Feather name={icon as any} size={fp(16)} color={focused ? colors.accent : colors.textHint} />
    <TextInput
      style={[$.input, { color: colors.text }]}
      placeholder={placeholder} placeholderTextColor={colors.textHint}
      value={value} onChangeText={onChangeText}
      onFocus={onFocus} onBlur={onBlur}
      secureTextEntry={secure} autoCapitalize="none"
    />
  </View>
);

const $ = StyleSheet.create({
  root: { flex: 1 },

  buddyWrap: { alignItems: 'center', marginBottom: wp(16) },
  title: { fontSize: fp(24), fontWeight: '800', marginBottom: wp(6), textAlign: 'center', letterSpacing: 0.3 },
  sub: { fontSize: fp(13), marginBottom: wp(28), textAlign: 'center', letterSpacing: 0.2 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(52), borderRadius: wp(9999), borderWidth: 1.5,
    paddingHorizontal: wp(18), marginBottom: wp(14),
  },
  input: { flex: 1, fontSize: FontSize.lg, marginLeft: wp(10), padding: 0 },

  btn: {
    height: wp(52), borderRadius: wp(9999),
    justifyContent: 'center', alignItems: 'center',
    marginTop: wp(10),
  },
  btnT: { color: '#fff', fontSize: fp(16), fontWeight: '800', letterSpacing: 2 },

  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(24) },
  bottomText: { fontSize: fp(13) },
  bottomLink: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(4) },
});
