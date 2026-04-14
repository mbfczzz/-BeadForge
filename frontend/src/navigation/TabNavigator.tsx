import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme } from '../theme';
import { wp, fp } from '../utils/responsive';
import { hapticSelection } from '../hooks/useFeedback';

const Tab = createBottomTabNavigator();

const TABS: { name: string; label: string; icon: string; color: string; center?: boolean }[] = [
  { name: 'Home', label: '发现', icon: 'compass', color: '#4b78ff' },
  { name: 'Market', label: '市场', icon: 'shopping-bag', color: '#F97316' },
  { name: 'Create', label: '创作', icon: 'plus', color: '#8B5CF6', center: true },
  { name: 'Publish', label: '动态', icon: 'zap', color: '#22C55E' },
  { name: 'Profile', label: '我的', icon: 'user', color: '#EC4899' },
];

const SCREENS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen, Market: MarketScreen, Create: CreateScreen,
  Publish: PublishScreen, Profile: ProfileScreen,
};

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[$.bar, { paddingBottom: Math.max(insets.bottom, wp(4)), backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
      {state.routes.map((route: any, idx: number) => {
        const tab = TABS[idx];
        const on = state.index === idx;
        const go = () => { if (!on) { hapticSelection(); navigation.navigate(route.name); } };
        const tintColor = on ? tab.color : colors.textHint;

        if (tab.center) {
          return (
            <TouchableOpacity key={route.key} activeOpacity={0.75} onPress={go} style={$.centerWrap}>
              <View style={[$.centerOuter, { borderColor: dark ? '#333' : '#e8e8e8' }]}>
                <View style={[$.centerInner, { backgroundColor: tab.color }]}>
                  <Feather name="plus" size={wp(20)} color="#fff" />
                </View>
              </View>
              <Text style={[$.centerLabel, { color: on ? tab.color : colors.textHint }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} activeOpacity={0.6} onPress={go} style={$.tab}>
            {/* 选中背景 pill */}
            {on && <View style={[$.activePill, { backgroundColor: tab.color + '12' }]} />}
            <Feather name={tab.icon as any} size={wp(on ? 21 : 20)} color={tintColor} />
            <Text style={[$.label, { color: tintColor }, on && { fontWeight: '700' }]}>{tab.label}</Text>
          </TouchableOpacity>
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
    width: wp(40), height: wp(28), borderRadius: wp(14),
  },
  label: {
    fontSize: fp(10), marginTop: wp(2), fontWeight: '400',
  },

  // 中间创作按钮
  centerWrap: {
    flex: 1, alignItems: 'center',
    marginTop: -wp(16),
  },
  centerOuter: {
    width: wp(50), height: wp(50), borderRadius: wp(25),
    borderWidth: wp(3), justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  centerInner: {
    width: wp(40), height: wp(40), borderRadius: wp(20),
    justifyContent: 'center', alignItems: 'center',
  },
  centerLabel: {
    fontSize: fp(10), fontWeight: '500', marginTop: wp(2),
  },
});
