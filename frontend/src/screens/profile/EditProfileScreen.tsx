import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onBack: () => void; }

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onBack}><Text style={styles.navBack}>取消</Text></TouchableOpacity>
        <Text style={styles.navTitle}>编辑资料</Text>
        <TouchableOpacity onPress={handleSave}><Text style={styles.navSave}>保存</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarWrap}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={80} />
          <Text style={styles.avatarHint}>更换头像</Text>
        </TouchableOpacity>
        <Input label="昵称" placeholder="输入昵称" value={nickname} onChangeText={setNickname} />
        <Input label="邮箱" placeholder="选填" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="手机号" placeholder="选填" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 48,
    borderBottomWidth: 1, borderBottomColor: Colors.grayBg,
  },
  navBack: { fontSize: FontSize.lg, color: Colors.grayDark },
  navTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.black },
  navSave: { fontSize: FontSize.lg, color: Colors.accent, fontWeight: '600' },
  content: { padding: Spacing.xl },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarHint: { fontSize: FontSize.sm, color: Colors.accent, marginTop: Spacing.sm },
});
