import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, ListRow, SurfaceCard, Toggle } from '../../components/common';
import { useTheme } from '../../theme';
import { wp } from '../../utils/responsive';
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
      <AppHeader title="设置" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$.content}>
        <SurfaceCard title="显示" description="主题与视觉偏好会影响全局 HeroUI 组件表现。">
          <ListRow
            icon="moon"
            label="深色模式"
            description="启动时默认读取系统外观，也可以在这里手动切换。"
            right={
              <Toggle value={dark} onValueChange={toggle} />
            }
            showChevron={false}
          />
        </SurfaceCard>

        <SurfaceCard title="账号" description="当前演示环境使用本地 mock 数据。">
          <ListRow label="当前账号" value={user?.username || 'demo'} showChevron={false} />
          <ListRow label="测试密码" value={TEST_LOGIN_CREDENTIALS.password} showChevron={false} divider />
        </SurfaceCard>

        <SurfaceCard title="操作" description="退出后会返回登录页，但不会清除演示数据。">
          <ListRow
            icon="log-out"
            label="退出登录"
            description="返回登录页"
            onPress={handleLogout}
            tone="danger"
          />
        </SurfaceCard>
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
    paddingTop: wp(12),
    paddingBottom: wp(40),
    gap: wp(16),
  },
});
