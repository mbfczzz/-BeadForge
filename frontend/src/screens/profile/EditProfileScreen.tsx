import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Input } from '../../components/common';
import { Spacing, FontSize, useTheme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onBack: () => void; }

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity onPress={onBack}><Text style={[styles.navBack, { color: colors.textSecondary }]}>取消</Text></TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>编辑资料</Text>
        <TouchableOpacity onPress={handleSave}><Text style={[styles.navSave, { color: colors.accent }]}>保存</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarWrap} onPress={() => Alert.alert('更换头像', '暂不支持上传，后续版本开放')}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={72} />
          <Text style={[styles.avatarHint, { color: colors.accent }]}>更换头像</Text>
        </TouchableOpacity>
        <Input label="昵称" placeholder="输入昵称" value={nickname} onChangeText={setNickname} />
        <Input label="邮箱" placeholder="选填" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="手机号" placeholder="选填" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 48, borderBottomWidth: 1,
  },
  navBack: { fontSize: FontSize.md },
  navTitle: { fontSize: FontSize.lg, fontWeight: '600' },
  navSave: { fontSize: FontSize.md, fontWeight: '600' },
  content: { padding: Spacing.xl },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarHint: { fontSize: FontSize.sm, marginTop: Spacing.sm },
});
