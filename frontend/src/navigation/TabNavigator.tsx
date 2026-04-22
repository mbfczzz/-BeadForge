import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme, candyShadow } from '../theme';
import { wp, fp } from '../utils/responsive';
import { hapticSelection } from '../hooks/useFeedback';

const Tab = createBottomTabNavigator();

/**
 * 糖果风底 Tab — 每个 tab 选中时：
 *  - 图标放大 bounce + 上浮
 *  - pill 背景做 morph（宽度动画）
 *  - 中间创作按钮选中时有额外弹跳
 */

// 糖果化配色（非冷调）
const TABS: { name: string; label: string; icon: string; color: string; center?: boolean }[] = [
  { name: 'Home',    label: '发现', icon: 'compass',       color: '#FF8FB1' },
  { name: 'Publish', label: '动态', icon: 'zap',           color: '#6ED39F' },
  { name: 'Create',  label: '创作', icon: 'plus',          color: '#FFB894', center: true },
  { name: 'Market',  label: '市场', icon: 'shopping-bag',  color: '#FFC870' },
  { name: 'Profile', label: '我的', icon: 'user',          color: '#D4B8FF' },
];

const SCREENS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen, Market: MarketScreen, Create: CreateScreen,
  Publish: PublishScreen, Profile: ProfileScreen,
};

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        $.bar,
        {
          paddingBottom: Math.max(insets.bottom, wp(4)),
          backgroundColor: colors.navBg,
          borderTopColor: colors.navBorder,
        },
      ]}
    >
      {state.routes.map((route: any, idx: number) => {
        const tab = TABS[idx];
        const on = state.index === idx;
        const go = () => { if (!on) { hapticSelection(); navigation.navigate(route.name); } };
        const tintColor = on ? tab.color : colors.textHint;

        if (tab.center) {
          return (
            <Pressable key={route.key} onPress={go} style={$.centerWrap}>
              <MotiView
                animate={{ scale: on ? 1.08 : 1, rotate: on ? '0deg' : '0deg' }}
                transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                style={[
                  $.centerOuter,
                  { backgroundColor: colors.surface, borderColor: dark ? '#3A2A44' : '#FFEDE2' },
                ]}
              >
                <MotiView
                  animate={{ scale: on ? 1 : 0.95 }}
                  transition={{ type: 'spring', damping: 10 }}
                  style={[
                    $.centerInner,
                    { backgroundColor: tab.color },
                    candyShadow(tab.color, 'md'),
                  ]}
                >
                  <Feather name="plus" size={wp(22)} color="#fff" />
                </MotiView>
              </MotiView>
              <Text style={[$.centerLabel, { color: on ? tab.color : colors.textHint, fontWeight: on ? '700' : '500' }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={go} style={$.tab}>
            {/* morph pill */}
            <MotiView
              animate={{
                opacity: on ? 1 : 0,
                scale: on ? 1 : 0.6,
                width: on ? wp(44) : wp(28),
              }}
              transition={{ type: 'spring', damping: 14, stiffness: 200 }}
              style={[$.activePill, { backgroundColor: tab.color + '26' }]}
            />
            <MotiView
              animate={{
                scale: on ? 1.15 : 1,
                translateY: on ? -2 : 0,
              }}
              transition={{ type: 'spring', damping: 10, stiffness: 260 }}
            >
              <Feather name={tab.icon as any} size={wp(21)} color={tintColor} />
            </MotiView>
            <Text
              style={[
                $.label,
                { color: tintColor, fontWeight: on ? '700' : '500' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={SCREENS[t.name]} />)}
  </Tab.Navigator>
);

const $ = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingTop: wp(6),
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // 普通 tab
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: wp(6),
  },
  activePill: {
    position: 'absolute', top: wp(2),
    height: wp(30), borderRadius: wp(15),
  },
  label: {
    fontSize: fp(10), marginTop: wp(3), letterSpacing: 0.3,
  },

  // 中间创作按钮
  centerWrap: {
    flex: 1, alignItems: 'center',
    marginTop: -wp(18),
  },
  centerOuter: {
    width: wp(56), height: wp(56), borderRadius: wp(28),
    borderWidth: wp(3), justifyContent: 'center', alignItems: 'center',
  },
  centerInner: {
    width: wp(42), height: wp(42), borderRadius: wp(21),
    justifyContent: 'center', alignItems: 'center',
  },
  centerLabel: {
    fontSize: fp(10), marginTop: wp(3), letterSpacing: 0.3,
  },
});
