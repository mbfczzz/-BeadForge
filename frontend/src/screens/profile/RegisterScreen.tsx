import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

interface Props {
  onSwitchToLogin: () => void;
}

interface InputRowProps {
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
  secure?: boolean;
}

const InputRow: React.FC<InputRowProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  colors,
  secure,
}) => (
  <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
    <Feather name={icon} size={fp(16)} color={colors.textHint} />
    <TextInput
      style={[$.input, { color: colors.text }]}
      placeholder={placeholder}
      placeholderTextColor={colors.textHint}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      autoCapitalize="none"
    />
  </View>
);

export const RegisterScreen: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { colors } = useTheme();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <KeyboardAvoidingView style={$.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[$.content, { backgroundColor: colors.bg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[$.title, { color: colors.text }]}>创建本地账号</Text>
          <Text style={[$.subtitle, { color: colors.textHint }]}>
            注册后会直接进入当前 mock 测试环境。
          </Text>

          <InputRow
            icon="user"
            placeholder="用户名"
            value={username}
            onChangeText={setUsername}
            colors={colors}
          />
          <InputRow
            icon="edit-3"
            placeholder="昵称（选填）"
            value={nickname}
            onChangeText={setNickname}
            colors={colors}
          />

          <View style={[$.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="lock" size={fp(16)} color={colors.textHint} />
            <TextInput
              style={[$.input, { color: colors.text }]}
              placeholder="密码（至少 6 位）"
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

          <InputRow
            icon="shield"
            placeholder="确认密码"
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            colors={colors}
            secure={!showPwd}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
            style={[$.submit, { backgroundColor: colors.accent, opacity: loading ? 0.65 : 1 }]}
          >
            <Text style={$.submitText}>{loading ? '注册中...' : '注册'}</Text>
          </TouchableOpacity>

          <View style={$.footerRow}>
            <Text style={[$.footerText, { color: colors.textHint }]}>已经有账号？</Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.6}>
              <Text style={[$.footerLink, { color: colors.accent }]}>返回登录</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    fontSize: fp(24),
    fontWeight: '800',
    marginBottom: wp(4),
  },
  subtitle: {
    fontSize: fp(13),
    marginBottom: wp(24),
    lineHeight: fp(19),
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
