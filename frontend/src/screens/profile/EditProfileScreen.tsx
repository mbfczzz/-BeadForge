import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(14);
const GENDER_OPTIONS = ['男', '女', '保密'] as const;

interface Props {
  onBack: () => void;
}

interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accentPlaceholder?: boolean;
}

interface SelectRowProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
}

interface BottomSheetPickerProps {
  visible: boolean;
  title: string;
  options: readonly string[];
  currentValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  accentPlaceholder = false,
}: InputRowProps) {
  const { colors } = useTheme();
  const displayColor = value
    ? colors.textSecondary
    : accentPlaceholder
      ? '#B6C2D1'
      : colors.textHint;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={displayColor}
        textAlign="right"
        style={[styles.valueInput, { color: displayColor }]}
      />
    </View>
  );
}

function SelectRow({ label, value, placeholder, onPress }: SelectRowProps) {
  const { colors } = useTheme();
  const resolvedValue = value || placeholder || '';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.selectValueWrap}>
        <Text
          style={[
            styles.selectValue,
            { color: value ? colors.textSecondary : '#B6C2D1' },
          ]}
        >
          {resolvedValue}
        </Text>
        <Feather name="chevron-right" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
}

function BottomSheetPicker({
  visible,
  title,
  options,
  currentValue,
  onSelect,
  onClose,
}: BottomSheetPickerProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          onPress={() => undefined}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <Text style={[styles.sheetAction, { color: colors.textHint }]}>关闭</Text>
            </TouchableOpacity>
          </View>
          {options.map((option) => {
            const active = option === currentValue;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.82}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                style={[styles.sheetRow, { borderTopColor: colors.divider }]}
              >
                <Text
                  style={[
                    styles.sheetRowText,
                    { color: active ? colors.accent : colors.text },
                  ]}
                >
                  {option}
                </Text>
                {active ? <Feather name="check" size={16} color={colors.accent} /> : null}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function parseBirthday(value?: string | null) {
  const currentYear = new Date().getFullYear();
  const match = value?.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);

  if (!match) {
    return { year: `${currentYear - 20}`, month: '01', day: '01' };
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
  };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function BirthdayPicker({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const parsed = parseBirthday(value);
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const next = parseBirthday(value);
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
  }, [value, visible]);

  const years = useMemo(
    () => Array.from({ length: currentYear - 1969 }, (_, index) => String(currentYear - index)),
    [currentYear],
  );
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')),
    [],
  );
  const days = useMemo(() => {
    const total = getDaysInMonth(Number(year), Number(month));
    return Array.from({ length: total }, (_, index) => String(index + 1).padStart(2, '0'));
  }, [month, year]);

  useEffect(() => {
    if (!days.includes(day)) {
      setDay(days[days.length - 1]);
    }
  }, [day, days]);

  const submit = () => {
    onConfirm(`${year}/${month}/${day}`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          onPress={() => undefined}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>选择生日</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={submit}>
              <Text style={[styles.sheetAction, { color: colors.accent }]}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateColumns}>
            <View style={styles.dateColumn}>
              <Text style={[styles.dateColumnLabel, { color: colors.textHint }]}>年</Text>
              <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                {years.map((item) => {
                  const active = item === year;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.82}
                      onPress={() => setYear(item)}
                      style={[
                        styles.dateChip,
                        { backgroundColor: active ? colors.accentLight : colors.inputBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          { color: active ? colors.accent : colors.textSecondary },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={[styles.dateColumnLabel, { color: colors.textHint }]}>月</Text>
              <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                {months.map((item) => {
                  const active = item === month;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.82}
                      onPress={() => setMonth(item)}
                      style={[
                        styles.dateChip,
                        { backgroundColor: active ? colors.accentLight : colors.inputBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          { color: active ? colors.accent : colors.textSecondary },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={[styles.dateColumnLabel, { color: colors.textHint }]}>日</Text>
              <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                {days.map((item) => {
                  const active = item === day;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.82}
                      onPress={() => setDay(item)}
                      style={[
                        styles.dateChip,
                        { backgroundColor: active ? colors.accentLight : colors.inputBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          { color: active ? colors.accent : colors.textSecondary },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const EditProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuthStore();

  const [avatar, setAvatar] = useState(user?.avatar || 'preset:ocean');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState(user?.gender || '保密');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [loading, setLoading] = useState(false);
  const [genderVisible, setGenderVisible] = useState(false);
  const [birthdayVisible, setBirthdayVisible] = useState(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);

  const changed = useMemo(
    () =>
      avatar !== (user?.avatar || 'preset:ocean') ||
      nickname !== (user?.nickname || '') ||
      bio !== (user?.bio || '') ||
      gender !== (user?.gender || '保密') ||
      birthday !== (user?.birthday || ''),
    [avatar, bio, birthday, gender, nickname, user],
  );

  const handleBack = useCallback(() => {
    if (!changed || loading) {
      onBack();
      return;
    }
    setLeaveConfirmVisible(true);
  }, [changed, loading, onBack]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [handleBack]);

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('无法访问相册', '请在系统设置中允许应用访问图片。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setAvatar(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        avatar,
        nickname: nickname.trim(),
        bio: bio.trim(),
        gender,
        birthday: birthday.trim(),
      });
      onBack();
    } catch (error: any) {
      Alert.alert('保存失败', error?.message || '个人信息更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: '#F4F6FA' }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.nav,
            { backgroundColor: colors.navBg, borderBottomColor: colors.divider },
          ]}
        >
          <TouchableOpacity style={styles.navButton} onPress={handleBack} activeOpacity={0.75}>
            <Feather name="arrow-left" size={fp(20)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.text }]}>个人信息</Text>
          <TouchableOpacity onPress={handleSave} disabled={!changed || loading} activeOpacity={0.75}>
            <Text
              style={[
                styles.saveText,
                { color: !changed || loading ? colors.textHint : colors.text },
              ]}
            >
              {loading ? '保存中' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <SectionCard>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={handlePickAvatar}
              style={[styles.row, styles.avatarRow]}
            >
              <Text style={[styles.label, { color: colors.text }]}>我的头像</Text>
              <Avatar uri={avatar} name={nickname || user?.username || 'BF'} size={wp(48)} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <InputRow
              label="昵称"
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
            />

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <InputRow
              label="个性签名"
              value={bio}
              onChangeText={setBio}
              placeholder="点击添加"
              accentPlaceholder
            />
          </SectionCard>

          <SectionCard>
            <SelectRow label="性别" value={gender} onPress={() => setGenderVisible(true)} />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SelectRow
              label="生日"
              value={birthday}
              placeholder="点击添加"
              onPress={() => setBirthdayVisible(true)}
            />
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheetPicker
        visible={genderVisible}
        title="选择性别"
        options={GENDER_OPTIONS}
        currentValue={gender}
        onSelect={setGender}
        onClose={() => setGenderVisible(false)}
      />
      <BirthdayPicker
        visible={birthdayVisible}
        value={birthday}
        onConfirm={setBirthday}
        onClose={() => setBirthdayVisible(false)}
      />
      <Modal
        visible={leaveConfirmVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLeaveConfirmVisible(false)}
      >
        <Pressable
          style={[styles.overlay, styles.centerOverlay]}
          onPress={() => setLeaveConfirmVisible(false)}
        >
          <Pressable
            style={[styles.confirmCard, { backgroundColor: colors.surface }]}
            onPress={() => undefined}
          >
            <Text style={[styles.confirmTitle, { color: colors.text }]}>放弃修改？</Text>
            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              当前修改还没有保存，返回后将丢失。
            </Text>
            <View style={[styles.confirmActions, { borderTopColor: colors.divider }]}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.confirmButton}
                onPress={() => setLeaveConfirmVisible(false)}
              >
                <Text style={[styles.confirmButtonText, { color: colors.textSecondary }]}>
                  继续编辑
                </Text>
              </TouchableOpacity>
              <View style={[styles.confirmDivider, { backgroundColor: colors.divider }]} />
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.confirmButton}
                onPress={() => {
                  setLeaveConfirmVisible(false);
                  onBack();
                }}
              >
                <Text style={[styles.confirmButtonText, { color: '#2563EB' }]}>放弃</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    height: wp(54),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(14),
    borderBottomWidth: 1,
  },
  navButton: {
    width: wp(36),
    height: wp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: fp(17),
    fontWeight: '700',
  },
  saveText: {
    minWidth: wp(36),
    textAlign: 'right',
    fontSize: fp(16),
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: wp(14),
    paddingTop: wp(14),
    paddingBottom: wp(40),
    gap: wp(10),
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: wp(18),
    backgroundColor: '#FFFFFF',
  },
  row: {
    minHeight: wp(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
  },
  avatarRow: {
    minHeight: wp(78),
  },
  label: {
    fontSize: fp(15),
    fontWeight: '600',
  },
  valueInput: {
    flex: 1,
    marginLeft: wp(20),
    fontSize: fp(15),
    paddingVertical: 0,
  },
  selectValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginLeft: wp(18),
  },
  selectValue: {
    fontSize: fp(15),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: PAD,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    justifyContent: 'flex-end',
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(28),
  },
  sheet: {
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingBottom: wp(20),
  },
  confirmCard: {
    width: '100%',
    borderRadius: wp(22),
    paddingTop: wp(24),
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  confirmTitle: {
    paddingHorizontal: wp(24),
    fontSize: fp(20),
    fontWeight: '800',
  },
  confirmDesc: {
    paddingHorizontal: wp(24),
    marginTop: wp(12),
    marginBottom: wp(22),
    fontSize: fp(15),
    lineHeight: fp(22),
  },
  confirmActions: {
    height: wp(56),
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: fp(16),
    fontWeight: '700',
  },
  confirmDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  sheetHeader: {
    minHeight: wp(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(18),
  },
  sheetTitle: {
    fontSize: fp(16),
    fontWeight: '700',
  },
  sheetAction: {
    fontSize: fp(14),
    fontWeight: '600',
  },
  sheetRow: {
    minHeight: wp(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(18),
    borderTopWidth: 1,
  },
  sheetRowText: {
    fontSize: fp(15),
  },
  dateColumns: {
    flexDirection: 'row',
    paddingHorizontal: wp(12),
    gap: wp(10),
  },
  dateColumn: {
    flex: 1,
  },
  dateColumnLabel: {
    marginBottom: wp(8),
    paddingHorizontal: wp(6),
    fontSize: fp(12),
  },
  dateScroll: {
    maxHeight: wp(280),
  },
  dateChip: {
    borderRadius: wp(14),
    marginBottom: wp(8),
    paddingVertical: wp(10),
    alignItems: 'center',
  },
  dateChipText: {
    fontSize: fp(14),
    fontWeight: '600',
  },
});
