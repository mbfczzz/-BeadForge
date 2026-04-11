import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
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

const Tab = createBottomTabNavigator();

const TABS: { name: string; label: string; icon: keyof typeof Feather.glyphMap; component: React.ComponentType<any> }[] = [
  { name: 'Home', label: '发现', icon: 'compass', component: HomeScreen },
  { name: 'Market', label: '市场', icon: 'shopping-bag', component: MarketScreen },
  { name: 'Create', label: '创作', icon: 'plus-circle', component: CreateScreen },
  { name: 'Publish', label: '动态', icon: 'send', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: 'user', component: ProfileScreen },
];

function CustomTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[S.bar, {
      paddingBottom: Math.max(insets.bottom, wp(5)),
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
        return <TabBtn key={route.key} icon={tab.icon} label={tab.label} focused={focused} onPress={onPress}
          activeColor={colors.text} inactiveColor={colors.textHint} />;
      })}
    </View>
  );
}

const TabBtn = memo(({ icon, label, focused, onPress, activeColor, inactiveColor }: any) => {
  const [hovered, setHovered] = useState(false);
  const color = focused ? activeColor : inactiveColor;
  const op = focused ? 1 : hovered ? 0.7 : 0.5;
  const ty = hovered ? -wp(2) : 0;

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
        { opacity: op, transform: [{ translateY: ty }] },
        Platform.OS === 'web' && { transitionDuration: '0.2s' } as any,
      ]}>
        <Feather name={icon} size={wp(20)} color={color} />
        <Text style={[S.tabLabel, { color }]}>{label}</Text>
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
    flexDirection: 'row', paddingTop: wp(8),
    borderTopWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 -1px 4px rgba(0,0,0,0.05)' } as any,
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  tab: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center' },
  tabLabel: { fontSize: fp(10), fontWeight: '500', marginTop: wp(3) },
});
