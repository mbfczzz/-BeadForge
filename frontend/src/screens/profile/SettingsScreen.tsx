import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, Avatar, Toggle } from '../../components/common';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { shadow } from '../../utils/shadow';
import { clearAppCache, formatCacheBytes, getAppCacheSummary, type CacheSummary } from '../../utils/cacheManager';

const PAD = wp(12);

type SettingsPanel = 'password' | 'devices' | 'dm' | 'blacklist' | 'cache' | 'legal';
type DmPermission = '所有人' | '关注的人' | '不允许';

const INITIAL_DEVICES = [
  { id: 'current', name: 'Pixel 8 模拟器', meta: '当前设备 · 上海 · 08:42', current: true },
  { id: 'ios', name: 'iPhone 15 Pro', meta: '昨天 21:08 · 杭州', current: false },
  { id: 'web', name: 'Chrome Web', meta: '3 天前 · 北京', current: false },
];

const INITIAL_BLACKLIST = [
  { id: 'u1', name: '广告小号', reason: '频繁发送无关私信' },
  { id: 'u2', name: '搬运账号', reason: '不想看到此用户动态' },
];

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  value?: string;
  danger?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={$.section}>
      <Text style={[$.sectionTitle, { color: colors.textHint }]}>{title}</Text>
      <View style={[$.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  description,
  value,
  danger = false,
  right,
  onPress,
}: SettingRowProps) {
  const { colors } = useTheme();

  const content = (
    <>
      <View
        style={[
          $.rowIcon,
          {
            backgroundColor: danger ? `${colors.error}14` : colors.inputBg,
          },
        ]}
      >
        <Feather name={icon} size={fp(15)} color={danger ? colors.error : colors.textSecondary} />
      </View>
      <View style={$.rowMain}>
        <Text style={[$.rowTitle, { color: danger ? colors.error : colors.text }]}>{title}</Text>
        {description ? (
          <Text style={[$.rowDesc, { color: colors.textHint }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? <Text style={[$.rowValue, { color: colors.textHint }]}>{value}</Text> : null}
      {right || (onPress ? <Feather name="chevron-right" size={fp(16)} color={colors.textHint} /> : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={$.row}>
        {content}
      </Pressable>
    );
  }

  return <View style={$.row}>{content}</View>;
}

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark, toggle } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [activePanel, setActivePanel] = useState<SettingsPanel | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [privateLikeEnabled, setPrivateLikeEnabled] = useState(false);
  const [saveOriginalEnabled, setSaveOriginalEnabled] = useState(true);
  const [dmPermission, setDmPermission] = useState<DmPermission>('关注的人');
  const [cacheSummary, setCacheSummary] = useState<CacheSummary | null>(null);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [blacklist, setBlacklist] = useState(INITIAL_BLACKLIST);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const displayName = user?.nickname || user?.username || 'demo';
  const initials = useMemo(() => displayName.slice(0, 2).toUpperCase(), [displayName]);

  useEffect(() => {
    let mounted = true;

    getAppCacheSummary()
      .then((summary) => {
        if (mounted) {
          setCacheSummary(summary);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

  const closePanel = () => setActivePanel(null);

  const handleSavePassword = async () => {
    if (passwordSaving) return;

    const oldP = oldPassword.trim();
    const newP = newPassword.trim();
    const confirmP = confirmPassword.trim();

    if (!oldP || !newP || !confirmP) {
      Alert.alert('请补全信息', '请输入当前密码、新密码和确认密码。');
      return;
    }
    if (newP.length < 8 || newP.length > 32) {
      Alert.alert('密码长度不符', '新密码长度需 8-32 位。');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(newP)) {
      Alert.alert('密码强度不足', '新密码需同时包含字母和数字。');
      return;
    }
    if (/\s/.test(newP)) {
      Alert.alert('格式错误', '新密码不能包含空格。');
      return;
    }
    if (newP === oldP) {
      Alert.alert('密码未变更', '新密码不能与当前密码相同。');
      return;
    }
    if (newP !== confirmP) {
      Alert.alert('两次密码不一致', '请重新确认新密码。');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword({ oldPassword: oldP, newPassword: newP });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(
        '密码修改成功',
        '请使用新密码重新登录。',
        [
          {
            text: '重新登录',
            onPress: () => {
              void logout();
            },
          },
        ],
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '修改失败，请稍后重试。';
      Alert.alert('修改失败', msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const removeDevice = (id: string) => {
    setDevices((current) => current.filter((item) => item.id !== id || item.current));
  };

  const clearCache = async () => {
    if (!cacheSummary || cacheSummary.totalBytes === 0 || cacheClearing) {
      return;
    }

    setCacheClearing(true);
    setCacheMessage('');
    try {
      const summary = await clearAppCache();
      setCacheSummary(summary);
      setCacheMessage('缓存已清理，图片和动态预览会在下次打开时重新生成。');
    } catch (error: any) {
      setCacheMessage(error?.message || '清理失败，请稍后重试。');
    } finally {
      setCacheClearing(false);
    }
  };

  if (activePanel === 'password') {
    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="登录密码" onBack={closePanel} />
        <ScrollView contentContainerStyle={$.panelContent} showsVerticalScrollIndicator={false}>
          <View style={[$.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              placeholder="当前密码"
              placeholderTextColor={colors.textHint}
              editable={!passwordSaving}
              style={[$.input, { color: colors.text, backgroundColor: colors.inputBg }]}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholder="新密码，8-32 位且包含字母和数字"
              placeholderTextColor={colors.textHint}
              editable={!passwordSaving}
              style={[$.input, { color: colors.text, backgroundColor: colors.inputBg }]}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholder="再次输入新密码"
              placeholderTextColor={colors.textHint}
              editable={!passwordSaving}
              style={[$.input, { color: colors.text, backgroundColor: colors.inputBg }]}
            />
            <Pressable
              onPress={handleSavePassword}
              disabled={passwordSaving}
              style={[$.primaryButton, { backgroundColor: colors.accent, opacity: passwordSaving ? 0.6 : 1 }]}
            >
              <Text style={$.primaryButtonText}>{passwordSaving ? '保存中...' : '保存新密码'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (activePanel === 'devices') {
    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="登录设备" onBack={closePanel} />
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={$.panelContent}
          renderItem={({ item }) => (
            <View style={[$.deviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[$.rowIcon, { backgroundColor: colors.inputBg }]}>
                <Feather name={item.current ? 'smartphone' : 'monitor'} size={fp(15)} color={colors.textSecondary} />
              </View>
              <View style={$.rowMain}>
                <Text style={[$.rowTitle, { color: colors.text }]}>{item.name}</Text>
                <Text style={[$.rowDesc, { color: colors.textHint }]}>{item.meta}</Text>
              </View>
              {item.current ? (
                <View style={[$.statusPill, { backgroundColor: colors.accentLight }]}>
                  <Text style={[$.statusText, { color: colors.accent }]}>当前</Text>
                </View>
              ) : (
                <Pressable onPress={() => removeDevice(item.id)} style={[$.miniDangerButton, { borderColor: `${colors.error}40` }]}>
                  <Text style={[$.miniDangerText, { color: colors.error }]}>移除</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  if (activePanel === 'dm') {
    const options: DmPermission[] = ['所有人', '关注的人', '不允许'];

    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="私信权限" onBack={closePanel} />
        <View style={$.panelContent}>
          <View style={[$.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {options.map((option, index) => (
              <Pressable
                key={option}
                onPress={() => setDmPermission(option)}
                style={[$.choiceRow, index > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}
              >
                <View>
                  <Text style={[$.rowTitle, { color: colors.text }]}>{option}</Text>
                  <Text style={[$.rowDesc, { color: colors.textHint }]}>
                    {option === '所有人' ? '任何用户都可以发起私信' : option === '关注的人' ? '仅你关注的人可以发起私信' : '关闭新的私信入口'}
                  </Text>
                </View>
                {dmPermission === option ? <Feather name="check" size={fp(18)} color={colors.accent} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (activePanel === 'blacklist') {
    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="黑名单" onBack={closePanel} />
        <FlatList
          data={blacklist}
          keyExtractor={(item) => item.id}
          contentContainerStyle={$.panelContent}
          ListEmptyComponent={
            <View style={$.emptyPanel}>
              <Feather name="smile" size={fp(24)} color={colors.textHint} />
              <Text style={[$.emptyText, { color: colors.textHint }]}>黑名单为空</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[$.deviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Avatar name={item.name} size={wp(36)} />
              <View style={$.rowMain}>
                <Text style={[$.rowTitle, { color: colors.text }]}>{item.name}</Text>
                <Text style={[$.rowDesc, { color: colors.textHint }]}>{item.reason}</Text>
              </View>
              <Pressable
                onPress={() => setBlacklist((current) => current.filter((userItem) => userItem.id !== item.id))}
                style={[$.miniButton, { backgroundColor: colors.inputBg }]}
              >
                <Text style={[$.miniButtonText, { color: colors.textSecondary }]}>移除</Text>
              </Pressable>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  if (activePanel === 'cache') {
    const cacheTotalLabel = cacheSummary?.totalLabel || '计算中';
    const cacheItems = cacheSummary?.items || [];
    const canClearCache = Boolean(cacheSummary && cacheSummary.totalBytes > 0 && !cacheClearing);

    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="缓存管理" onBack={closePanel} />
        <View style={$.panelContent}>
          <View style={[$.cacheHero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[$.cacheIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name="database" size={fp(22)} color={colors.accent} />
            </View>
            <Text style={[$.cacheValue, { color: colors.text }]}>{cacheTotalLabel}</Text>
            <Text style={[$.cacheLabel, { color: colors.textHint }]}>图片预览、动图缩略图、本地浏览缓存</Text>

            <View style={$.cacheList}>
              {cacheItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    $.cacheItem,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
                  ]}
                >
                  <View style={$.cacheItemMain}>
                    <Text style={[$.cacheItemTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[$.cacheItemDesc, { color: colors.textHint }]}>{item.description}</Text>
                  </View>
                  <Text style={[$.cacheItemValue, { color: colors.textSecondary }]}>
                    {formatCacheBytes(item.bytes)}
                  </Text>
                </View>
              ))}
            </View>

            {cacheMessage ? (
              <View
                style={[
                  $.cacheMessage,
                  { backgroundColor: cacheSummary?.totalBytes === 0 ? colors.accentLight : `${colors.error}12` },
                ]}
              >
                <Feather
                  name={cacheSummary?.totalBytes === 0 ? 'check-circle' : 'alert-circle'}
                  size={fp(14)}
                  color={cacheSummary?.totalBytes === 0 ? colors.accent : colors.error}
                />
                <Text
                  style={[
                    $.cacheMessageText,
                    { color: cacheSummary?.totalBytes === 0 ? colors.accent : colors.error },
                  ]}
                >
                  {cacheMessage}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={clearCache}
              disabled={!canClearCache}
              style={[$.primaryButton, { backgroundColor: canClearCache ? colors.accent : colors.border }]}
            >
              <Text style={$.primaryButtonText}>
                {cacheClearing ? '清理中' : cacheSummary?.totalBytes === 0 ? '缓存已清理' : '立即清理'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (activePanel === 'legal') {
    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="协议与隐私" onBack={closePanel} />
        <ScrollView contentContainerStyle={$.panelContent} showsVerticalScrollIndicator={false}>
          <View style={[$.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[$.legalTitle, { color: colors.text }]}>用户协议</Text>
            <Text style={[$.legalText, { color: colors.textSecondary }]}>
              你可以在 BeadForge 中发布拼豆作品、照片、动图和评论。请确保上传内容为本人创作或已获得授权，并尊重其他用户的创作与交流边界。
            </Text>
            <View style={[$.divider, { backgroundColor: colors.divider, marginLeft: 0 }]} />
            <Text style={[$.legalTitle, { color: colors.text }]}>隐私政策</Text>
            <Text style={[$.legalText, { color: colors.textSecondary }]}>
              当前演示环境仅使用本地 mock 数据，不会上传真实账号、图片或聊天内容。正式环境应提供数据导出、删除账号和隐私权限管理能力。
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="设置" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$.content}>
        <View style={[$.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Avatar name={initials} size={wp(54)} />
          <View style={$.profileMain}>
            <Text style={[$.profileName, { color: colors.text }]}>{displayName}</Text>
            <Text style={[$.profileMeta, { color: colors.textHint }]}>照片、动图和拼豆作品账号</Text>
          </View>
          <View style={[$.statusPill, { backgroundColor: colors.accentLight }]}>
            <Text style={[$.statusText, { color: colors.accent }]}>已登录</Text>
          </View>
        </View>

        <SettingSection title="账号与安全">
          <SettingRow icon="user" title="当前账号" value={user?.username || 'demo'} />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="lock"
            title="登录密码"
            description="用于账号登录验证"
            value="已设置"
            onPress={() => setActivePanel('password')}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="shield"
            title="登录设备"
            description="查看最近登录过的设备"
            value={`${devices.length} 台`}
            onPress={() => setActivePanel('devices')}
          />
        </SettingSection>

        <SettingSection title="显示与偏好">
          <SettingRow
            icon="moon"
            title="深色模式"
            description="切换后会影响全局界面颜色"
            right={<Toggle value={dark} onValueChange={toggle} />}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="bell"
            title="互动通知"
            description="评论、喜欢、私信会显示提醒"
            right={<Toggle value={pushEnabled} onValueChange={setPushEnabled} />}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="image"
            title="保存原图"
            description="发布照片和动图时保留原始素材"
            right={<Toggle value={saveOriginalEnabled} onValueChange={setSaveOriginalEnabled} />}
          />
        </SettingSection>

        <SettingSection title="隐私">
          <SettingRow
            icon="heart"
            title="隐藏喜欢列表"
            description="开启后他人无法查看你的喜欢内容"
            right={<Toggle value={privateLikeEnabled} onValueChange={setPrivateLikeEnabled} />}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="message-circle"
            title="私信权限"
            description="允许关注的人向你发送私信"
            value={dmPermission}
            onPress={() => setActivePanel('dm')}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="eye-off"
            title="黑名单"
            description="管理不想看到的用户"
            value={`${blacklist.length} 人`}
            onPress={() => setActivePanel('blacklist')}
          />
        </SettingSection>

        <SettingSection title="存储与关于">
          <SettingRow
            icon="database"
            title="缓存管理"
            description="清理图片预览、动图缩略图缓存"
            value={cacheSummary?.totalLabel || '计算中'}
            onPress={() => setActivePanel('cache')}
          />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow icon="info" title="版本信息" value="v1.0.0" />
          <View style={[$.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="file-text"
            title="用户协议与隐私政策"
            onPress={() => setActivePanel('legal')}
          />
        </SettingSection>

        <Pressable
          onPress={handleLogout}
          style={[$.logoutButton, { backgroundColor: colors.surface, borderColor: `${colors.error}30` }]}
        >
          <Feather name="log-out" size={fp(16)} color={colors.error} />
          <Text style={[$.logoutText, { color: colors.error }]}>退出登录</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: wp(42),
    gap: wp(14),
  },
  profileCard: {
    minHeight: wp(82),
    borderRadius: wp(18),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow(2, 8, 0.025, '#0F172A', 1),
  },
  profileMain: {
    flex: 1,
    marginLeft: wp(12),
  },
  profileName: {
    fontSize: fp(16),
    fontWeight: '900',
  },
  profileMeta: {
    marginTop: wp(4),
    fontSize: fp(11),
  },
  statusPill: {
    minHeight: wp(28),
    borderRadius: wp(14),
    paddingHorizontal: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  section: {
    gap: wp(8),
  },
  sectionTitle: {
    marginLeft: wp(4),
    fontSize: fp(11),
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: wp(16),
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: wp(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
  },
  rowIcon: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    marginLeft: wp(10),
  },
  rowTitle: {
    fontSize: fp(13),
    fontWeight: '800',
  },
  rowDesc: {
    marginTop: wp(3),
    fontSize: fp(10),
    lineHeight: fp(15),
  },
  rowValue: {
    maxWidth: wp(118),
    fontSize: fp(11),
    fontWeight: '700',
    marginRight: wp(8),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: wp(56),
  },
  logoutButton: {
    minHeight: wp(46),
    borderRadius: wp(16),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
  },
  logoutText: {
    fontSize: fp(13),
    fontWeight: '900',
  },
  panelContent: {
    paddingHorizontal: PAD,
    paddingTop: wp(12),
    paddingBottom: wp(42),
    gap: wp(12),
  },
  panelCard: {
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(14),
    gap: wp(12),
  },
  input: {
    minHeight: wp(44),
    borderRadius: wp(14),
    paddingHorizontal: wp(12),
    fontSize: fp(13),
  },
  primaryButton: {
    minHeight: wp(44),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(16),
    marginTop: wp(2),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fp(13),
    fontWeight: '900',
  },
  deviceCard: {
    minHeight: wp(68),
    borderRadius: wp(16),
    borderWidth: 1,
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(10),
  },
  miniDangerButton: {
    minWidth: wp(54),
    height: wp(30),
    borderRadius: wp(15),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDangerText: {
    fontSize: fp(11),
    fontWeight: '900',
  },
  choiceRow: {
    minHeight: wp(62),
    paddingVertical: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  miniButton: {
    minWidth: wp(54),
    height: wp(30),
    borderRadius: wp(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniButtonText: {
    fontSize: fp(11),
    fontWeight: '900',
  },
  emptyPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(52),
    gap: wp(10),
  },
  emptyText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  cacheHero: {
    borderRadius: wp(20),
    borderWidth: 1,
    padding: wp(18),
    alignItems: 'center',
    gap: wp(10),
  },
  cacheIcon: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cacheValue: {
    fontSize: fp(30),
    fontWeight: '900',
  },
  cacheLabel: {
    fontSize: fp(12),
    textAlign: 'center',
    lineHeight: fp(18),
    marginBottom: wp(6),
  },
  cacheList: {
    alignSelf: 'stretch',
    borderRadius: wp(16),
    overflow: 'hidden',
  },
  cacheItem: {
    minHeight: wp(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(10),
  },
  cacheItemMain: {
    flex: 1,
    paddingRight: wp(12),
  },
  cacheItemTitle: {
    fontSize: fp(13),
    fontWeight: '900',
  },
  cacheItemDesc: {
    marginTop: wp(3),
    fontSize: fp(10),
    lineHeight: fp(15),
  },
  cacheItemValue: {
    fontSize: fp(12),
    fontWeight: '800',
  },
  cacheMessage: {
    alignSelf: 'stretch',
    minHeight: wp(38),
    borderRadius: wp(13),
    paddingHorizontal: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  cacheMessageText: {
    flex: 1,
    fontSize: fp(11),
    fontWeight: '800',
    lineHeight: fp(16),
  },
  legalTitle: {
    fontSize: fp(15),
    fontWeight: '900',
  },
  legalText: {
    fontSize: fp(12),
    lineHeight: fp(20),
  },
});
