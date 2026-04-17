import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { TEST_LOGIN_CREDENTIALS } from '../../mock/auth';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark, toggle } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

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

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>设置</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>显示</Text>
          <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={$.row}>
              <View style={[$.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Feather name="moon" size={fp(14)} color={colors.accent} />
              </View>
              <View style={$.rowText}>
                <Text style={[$.label, { color: colors.text }]}>深色模式</Text>
                <Text style={[$.desc, { color: colors.textHint }]}>启动时默认读取系统外观</Text>
              </View>
              <Switch
                value={dark}
                onValueChange={toggle}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>账号</Text>
          <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={$.infoRow}>
              <Text style={[$.infoLabel, { color: colors.textHint }]}>当前账号</Text>
              <Text style={[$.infoValue, { color: colors.text }]}>{user?.username || 'demo'}</Text>
            </View>
            <View style={[$.divider, { backgroundColor: colors.divider }]} />
            <View style={$.infoRow}>
              <Text style={[$.infoLabel, { color: colors.textHint }]}>测试密码</Text>
              <Text style={[$.infoValue, { color: colors.text }]}>{TEST_LOGIN_CREDENTIALS.password}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[$.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Feather name="log-out" size={fp(14)} color="#ef4444" />
          <Text style={$.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
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
  section: {
    marginTop: wp(18),
    paddingHorizontal: PAD,
  },
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '700',
    marginBottom: wp(10),
  },
  card: {
    borderRadius: wp(18),
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  iconWrap: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginLeft: wp(12),
  },
  label: {
    fontSize: fp(14),
    fontWeight: '600',
  },
  desc: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: wp(14),
  },
  infoLabel: {
    fontSize: fp(13),
  },
  infoValue: {
    fontSize: fp(13),
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: PAD,
    marginTop: wp(24),
    borderRadius: wp(18),
    borderWidth: 1,
    height: wp(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: fp(14),
    fontWeight: '700',
    marginLeft: wp(8),
  },
});
