import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme } from '../theme';
import { wp, fp } from '../utils/responsive';

const Tab = createBottomTabNavigator();

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: { name: string; label: string; icon: IconName; iconFocused: IconName; component: React.ComponentType<any> }[] = [
  { name: 'Home', label: '发现', icon: 'compass-outline', iconFocused: 'compass', component: HomeScreen },
  { name: 'Market', label: '市场', icon: 'store-outline', iconFocused: 'store', component: MarketScreen },
  { name: 'Create', label: '创作', icon: 'plus-circle-outline', iconFocused: 'plus-circle', component: CreateScreen },
  { name: 'Publish', label: '动态', icon: 'message-text-outline', iconFocused: 'message-text', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: 'account-outline', iconFocused: 'account', component: ProfileScreen },
];

function CustomTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[S.bar, {
      paddingBottom: Math.max(insets.bottom, wp(6)),
      backgroundColor: colors.navBg,
      borderTopColor: colors.navBorder,
    }]}>
      {state.routes.map((route: any, idx: number) => {
        const tab = TABS[idx];
        const focused = state.index === idx;
        const onPress = () => {
          const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
        };
        return <TabBtn key={route.key} icon={tab.icon} iconFocused={tab.iconFocused} label={tab.label}
          focused={focused} onPress={onPress} accentColor={colors.accent} inactiveColor={colors.textHint} />;
      })}
    </View>
  );
}

const TabBtn = memo(({ icon, iconFocused, label, focused, onPress, accentColor, inactiveColor }: any) => {
  const [hovered, setHovered] = useState(false);
  const color = focused ? accentColor : inactiveColor;

  return (
    <Pressable
      style={S.tab}
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View style={[
        S.tabInner,
        hovered && { transform: [{ translateY: -wp(1) }] },
        Platform.OS === 'web' && { transitionDuration: '0.15s' } as any,
      ]}>
        <MaterialCommunityIcons name={focused ? iconFocused : icon} size={wp(24)} color={color} />
        <Text style={[S.tabLabel, { color, fontWeight: focused ? '600' : '400', opacity: focused ? 1 : 0.65 }]}>{label}</Text>
      </View>
    </Pressable>
  );
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={t.component} />)}
  </Tab.Navigator>
);

const S = StyleSheet.create({
  bar: {
    flexDirection: 'row', paddingTop: wp(6), borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', paddingVertical: wp(3) },
  tabLabel: { fontSize: fp(10), marginTop: wp(2), letterSpacing: 0.1 },
});
