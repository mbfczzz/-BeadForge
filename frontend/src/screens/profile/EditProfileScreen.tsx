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
import { Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

interface InputRowProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  colors: any;
}

const InputRow: React.FC<InputRowProps> = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  colors,
}) => (
  <View style={$.fieldWrap}>
    <Text style={[$.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={[$.fieldBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
      <Feather name={icon} size={fp(15)} color={colors.textHint} />
      <TextInput
        style={[$.fieldInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textHint}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  </View>
);

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuthStore();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const changed =
    nickname !== (user?.nickname || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '');

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('提示', '邮箱格式不正确');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      Alert.alert('保存成功', '个人资料已更新。', [{ text: '确定', onPress: onBack }]);
    } catch (error: any) {
      Alert.alert('保存失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <KeyboardAvoidingView style={$.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
          <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
            <Feather name="arrow-left" size={fp(18)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[$.navTitle, { color: colors.text }]}>编辑资料</Text>
          <TouchableOpacity
            style={[
              $.saveButton,
              { backgroundColor: changed ? colors.accent : colors.border },
            ]}
            onPress={handleSave}
            disabled={!changed || loading}
            activeOpacity={0.75}
          >
            <Text style={$.saveButtonText}>{loading ? '保存中' : '保存'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
          <TouchableOpacity
            style={$.avatarArea}
            activeOpacity={0.8}
            onPress={() => Alert.alert('头像上传', '当前演示环境不支持上传头像。')}
          >
            <View style={$.avatarWrap}>
              <Avatar uri={user?.avatar} name={nickname || user?.username} size={wp(84)} />
              <View style={[$.avatarBadge, { backgroundColor: colors.accent }]}>
                <Feather name="camera" size={fp(12)} color="#fff" />
              </View>
            </View>
            <Text style={[$.avatarHint, { color: colors.accent }]}>点击头像可修改</Text>
          </TouchableOpacity>

          <View style={[$.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InputRow
              label="昵称"
              icon="user"
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
              colors={colors}
            />
            <InputRow
              label="邮箱"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="选填"
              colors={colors}
            />
            <InputRow
              label="手机号"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="选填"
              colors={colors}
            />
          </View>

          <View style={[$.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[$.noteTitle, { color: colors.text }]}>账号信息</Text>
            <Text style={[$.noteText, { color: colors.textHint }]}>
              用户名固定为 {user?.username || 'demo'}，当前演示环境不支持修改账号名。
            </Text>
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    height: wp(52),
    borderBottomWidth: 1,
  },
  navButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(16),
    fontWeight: '700',
  },
  saveButton: {
    minWidth: wp(56),
    height: wp(32),
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(12),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fp(12),
    fontWeight: '700',
  },
  avatarArea: {
    alignItems: 'center',
    paddingTop: wp(28),
    paddingBottom: wp(20),
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp(26),
    height: wp(26),
    borderRadius: wp(13),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    fontSize: fp(12),
    fontWeight: '600',
    marginTop: wp(12),
  },
  formCard: {
    marginHorizontal: PAD,
    borderRadius: wp(18),
    borderWidth: 1,
    paddingHorizontal: PAD,
    paddingVertical: wp(6),
  },
  fieldWrap: {
    paddingVertical: wp(12),
  },
  fieldLabel: {
    fontSize: fp(12),
    fontWeight: '600',
    marginBottom: wp(8),
  },
  fieldBox: {
    height: wp(46),
    borderRadius: wp(12),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
  },
  fieldInput: {
    flex: 1,
    fontSize: fp(14),
    marginLeft: wp(10),
    padding: 0,
  },
  noteCard: {
    marginHorizontal: PAD,
    marginTop: wp(16),
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(16),
  },
  noteTitle: {
    fontSize: fp(13),
    fontWeight: '700',
    marginBottom: wp(6),
  },
  noteText: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
});
