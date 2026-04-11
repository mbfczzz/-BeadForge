import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Avatar, Button, Input } from '../../components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

interface Props { onBack: () => void; }

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { user, updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) { Alert.alert('😅', '昵称不能为空'); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('😅', '邮箱格式不对'); return; }
    setLoading(true);
    try {
      await updateProfile({ nickname: nickname.trim(), email: email.trim() || null, phone: phone.trim() || null } as any);
      Alert.alert('🎉 成功', '资料已更新', [{ text: '好的', onPress: onBack }]);
    } catch (e: any) { Alert.alert('😵 失败', e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn}>
          <Text style={styles.navBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>编辑资料</Text>
        <View style={styles.navBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarWrap}>
          <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={88} borderColor={Colors.primary} />
          <Text style={styles.avatarHint}>点击更换头像</Text>
        </TouchableOpacity>
        <Input label="昵称" placeholder="输入昵称" value={nickname} onChangeText={setNickname} />
        <Input label="邮箱" placeholder="选填" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="手机号" placeholder="选填" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="保存修改" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 52,
    borderBottomWidth: 2, borderBottomColor: Colors.grayBg,
  },
  navBtn: { width: 70 },
  navBtnText: { fontSize: FontSize.md, color: Colors.blue, fontWeight: '700' },
  navTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  content: { padding: Spacing.xl },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarHint: { fontSize: FontSize.sm, color: Colors.gray, fontWeight: '600', marginTop: Spacing.sm },
});
