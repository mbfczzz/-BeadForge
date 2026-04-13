import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onSwitchToLogin: () => void }

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { colors, dark } = useTheme();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: wp(24) }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* 标题 */}
          <Text style={[$.title, { color: colors.text }]}>创建账号</Text>
          <Text style={[$.sub, { color: colors.textHint }]}>加入 BeadForge 社区</Text>

          {/* 用户名 */}
          <InputRow icon="user" placeholder="用户名" value={username} onChangeText={setUsername} colors={colors} />

          {/* 昵称 */}
          <InputRow icon="smile" placeholder="昵称（选填）" value={nickname} onChangeText={setNickname} colors={colors} />

          {/* 密码 */}
          <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="lock" size={fp(16)} color={colors.textHint} />
            <TextInput style={[$.input, { color: colors.text }]} placeholder="密码（至少6位）" placeholderTextColor={colors.textHint} value={password} onChangeText={setPassword} secureTextEntry={!showPwd} autoCapitalize="none" />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} activeOpacity={0.6}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={fp(16)} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          {/* 确认密码 */}
          <InputRow icon="shield" placeholder="确认密码" value={confirmPwd} onChangeText={setConfirmPwd} colors={colors} secure={!showPwd} />

          {/* 注册按钮 */}
          <TouchableOpacity
            activeOpacity={0.8} onPress={handleRegister} disabled={loading}
            style={[$.btn, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
          >
            <Text style={$.btnT}>{loading ? '注册中...' : '注册'}</Text>
          </TouchableOpacity>

          {/* 底部 */}
          <View style={$.bottomRow}>
            <Text style={[$.bottomText, { color: colors.textHint }]}>已有账号？</Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.6}>
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
  colors: any; secure?: boolean;
}> = ({ icon, placeholder, value, onChangeText, colors, secure }) => (
  <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
    <Feather name={icon as any} size={fp(16)} color={colors.textHint} />
    <TextInput
      style={[$.input, { color: colors.text }]}
      placeholder={placeholder} placeholderTextColor={colors.textHint}
      value={value} onChangeText={onChangeText}
      secureTextEntry={secure} autoCapitalize="none"
    />
  </View>
);

const $ = StyleSheet.create({
  root: { flex: 1 },

  title: { fontSize: fp(24), fontWeight: '800', marginBottom: wp(4) },
  sub: { fontSize: fp(13), marginBottom: wp(24) },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(48), borderRadius: wp(12), borderWidth: 1,
    paddingHorizontal: wp(14), marginBottom: wp(12),
  },
  input: { flex: 1, fontSize: fp(15), marginLeft: wp(10), padding: 0 },

  btn: {
    height: wp(48), borderRadius: wp(12),
    justifyContent: 'center', alignItems: 'center',
    marginTop: wp(6),
  },
  btnT: { color: '#fff', fontSize: fp(16), fontWeight: '700' },

  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: wp(20) },
  bottomText: { fontSize: fp(13) },
  bottomLink: { fontSize: fp(13), fontWeight: '700', marginLeft: wp(4) },
});
