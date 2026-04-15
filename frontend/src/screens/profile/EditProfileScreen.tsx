import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';

const PAD = wp(16);

interface Props { onBack: () => void }

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) { Alert.alert('提示', '昵称不能为空'); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('提示', '邮箱格式不对'); return; }
    setLoading(true);
    try {
      await updateProfile({ nickname: nickname.trim(), email: email.trim() || null, phone: phone.trim() || null } as any);
      Alert.alert('成功', '资料已更新', [{ text: '好的', onPress: onBack }]);
    } catch (e: any) { Alert.alert('失败', e.message); }
    finally { setLoading(false); }
  };

  const changed = nickname !== (user?.nickname || '') || email !== (user?.email || '') || phone !== (user?.phone || '');

  const renderField = (
    label: string, icon: string, value: string, onChange: (v: string) => void,
    opts?: { placeholder?: string; kbd?: 'email-address' | 'phone-pad' },
  ) => (
    <View style={$.fieldWrap}>
      <Text style={[$.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[$.fieldBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Feather name={icon as any} size={fp(14)} color={colors.textHint} />
        <TextInput
          style={[$.fieldInput, { color: colors.text }]}
          placeholder={opts?.placeholder || `输入${label}`}
          placeholderTextColor={colors.textHint}
          value={value}
          onChangeText={onChange}
          keyboardType={opts?.kbd}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 导航栏 */}
        <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={$.navBackBtn}>
            <Feather name="x" size={fp(18)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[$.navTitle, { color: colors.text }]}>编辑资料</Text>
          <TouchableOpacity onPress={handleSave} disabled={!changed || loading} activeOpacity={0.7}
            style={[$.saveBtn, { backgroundColor: changed ? colors.accent : colors.border }]}
          >
            <Text style={[$.saveBtnText, { opacity: changed ? 1 : 0.5 }]}>
              {loading ? '保存中' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={$.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* 头像区域 */}
          <TouchableOpacity
            style={$.avatarSection}
            onPress={() => Alert.alert('更换头像', '头像上传功能开发中')}
            activeOpacity={0.7}
          >
            <View style={$.avatarOuter}>
              <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={wp(80)} />
              <View style={[$.avatarEditBadge, { backgroundColor: colors.accent, borderColor: colors.bg }]}>
                <Feather name="camera" size={fp(12)} color="#fff" />
              </View>
            </View>
            <Text style={[$.avatarHint, { color: colors.accent }]}>点击更换头像</Text>
          </TouchableOpacity>

          {/* 表单 */}
          <View style={[$.formCard, { backgroundColor: colors.surface }]}>
            {renderField('昵称', 'user', nickname, setNickname)}
            {renderField('邮箱', 'mail', email, setEmail, { placeholder: '选填', kbd: 'email-address' })}
            {renderField('手机号', 'phone', phone, setPhone, { placeholder: '选填', kbd: 'phone-pad' })}
          </View>

          {/* 用户名不可改 */}
          <View style={[$.infoCard, { backgroundColor: dark ? '#1a1a1a' : '#FAFAFA' }]}>
            <Feather name="info" size={fp(12)} color={colors.textHint} />
            <Text style={[$.infoText, { color: colors.textHint }]}>
              用户名 @{user?.username} 创建后不可修改
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: PAD, height: wp(50),
    borderBottomWidth: 1,
  },
  navBackBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: { fontSize: fp(16), fontWeight: '700' },
  saveBtn: {
    paddingHorizontal: wp(16), paddingVertical: wp(7),
    borderRadius: wp(14),
  },
  saveBtnText: { color: '#fff', fontSize: fp(13), fontWeight: '700' },

  content: { paddingBottom: wp(40) },

  /* 头像 */
  avatarSection: { alignItems: 'center', paddingVertical: wp(28) },
  avatarOuter: { position: 'relative' },
  avatarEditBadge: {
    position: 'absolute', bottom: wp(2), right: wp(2),
    width: wp(26), height: wp(26), borderRadius: wp(13),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
  },
  avatarHint: { fontSize: fp(12), fontWeight: '500', marginTop: wp(10) },

  /* 表单 */
  formCard: {
    marginHorizontal: PAD, borderRadius: wp(14),
    paddingHorizontal: PAD, paddingVertical: wp(4),
  },
  fieldWrap: { paddingVertical: wp(12) },
  fieldLabel: { fontSize: fp(12), fontWeight: '600', marginBottom: wp(8) },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(46), borderRadius: wp(12), borderWidth: 1,
    paddingHorizontal: wp(14),
  },
  fieldInput: { flex: 1, fontSize: fp(14), marginLeft: wp(10), padding: 0 },

  /* 提示 */
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    marginHorizontal: PAD, marginTop: wp(16),
    padding: wp(12), borderRadius: wp(10),
  },
  infoText: { fontSize: fp(11), flex: 1, lineHeight: fp(16) },
});
