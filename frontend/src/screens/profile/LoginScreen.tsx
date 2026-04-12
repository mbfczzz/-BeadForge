import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/common';
import { BeadGrid, HEART_PATTERN } from '../../components/common/BeadGrid';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onSwitchToRegister: () => void; }

export const LoginScreen: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const login = useAuthStore((s) => s.login);

  const validate = () => {
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
    try { await login({ username: username.trim(), password }); }
    catch (e: any) { Alert.alert('登录失败', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* 品牌区 */}
          <View style={[s.brandArea, { backgroundColor: colors.accent },
            Platform.OS === 'web' && { backgroundImage: `linear-gradient(135deg, ${colors.accentGradStart} 0%, ${colors.accentGradEnd} 100%)` } as any,
          ]}>
            <View style={s.brandDeco}>
              <View style={{ opacity: 0.15 }}>
                <BeadGrid pixels={HEART_PATTERN} beadSize={wp(8)} gap={wp(2)} round />
              </View>
            </View>
            <Text style={s.brandEmoji}>🧩</Text>
            <Text style={s.brandName}>BeadForge</Text>
            <Text style={s.brandSub}>拼豆创作平台</Text>
          </View>

          {/* 表单区 */}
          <View style={[s.formCard, { backgroundColor: colors.surface }]}>
            <Text style={[s.formTitle, { color: colors.text }]}>欢迎回来</Text>
            <Text style={[s.formSub, { color: colors.textHint }]}>登录后即可创作和分享拼豆作品</Text>

            <Input label="用户名" placeholder="请输入用户名" value={username}
              onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }} error={errors.username} />
            <Input label="密码" placeholder="请输入密码" value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }} secureTextEntry error={errors.password} />

            <Button title="登录" onPress={handleLogin} loading={loading} style={{ marginTop: wp(8) }} />

            <View style={s.dividerRow}>
              <View style={[s.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[s.dividerText, { color: colors.textHint }]}>OR</Text>
              <View style={[s.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            <Button title="创建新账号" onPress={onSwitchToRegister} variant="outline" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  brandArea: {
    height: wp(220), justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  brandDeco: { position: 'absolute', right: wp(10), bottom: wp(10) },
  brandEmoji: { fontSize: fp(48), marginBottom: wp(10) },
  brandName: { fontSize: fp(28), fontWeight: '800', color: '#FFF', letterSpacing: 1.5 },
  brandSub: { fontSize: fp(13), color: 'rgba(255,255,255,0.8)', marginTop: wp(6) },

  formCard: {
    marginHorizontal: wp(16), marginTop: -wp(28),
    borderRadius: wp(18), padding: wp(24), paddingTop: wp(28),
    ...shadow(0, 10, 0.1, '#000', 5),
  },
  formTitle: { fontSize: fp(24), fontWeight: '700', marginBottom: wp(6) },
  formSub: { fontSize: fp(14), marginBottom: wp(22), lineHeight: fp(20) },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: wp(18) },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: wp(14), fontSize: fp(12), fontWeight: '600' },
});
