import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
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
  { name: 'Create', label: '', icon: 'plus', component: CreateScreen },
  { name: 'Publish', label: '动态', icon: 'send', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: 'user', component: ProfileScreen },
];

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, wp(6));

  return (
    <View style={[S.bar, {
      paddingBottom: bottomPad,
      backgroundColor: dark ? 'rgba(12,12,29,0.98)' : 'rgba(255,255,255,0.98)',
      borderTopColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    }]}>
      {state.routes.map((route: any, idx: number) => {
        const tab = TABS[idx];
        const focused = state.index === idx;
        const isCenter = idx === 2;
        const onPress = () => {
          const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
        };

        if (isCenter) return <CenterBtn key={route.key} focused={focused} onPress={onPress} accent={colors.accent} />;
        return <TabBtn key={route.key} icon={tab.icon} label={tab.label} focused={focused} onPress={onPress} accent={colors.accent} hint={colors.textHint} />;
      })}
    </View>
  );
}

const TabBtn = memo(({ icon, label, focused, onPress, accent, hint }: any) => {
  const scl = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scl, { toValue: focused ? 1.08 : 1, useNativeDriver: true, speed: 25, bounciness: 12 }).start();
  }, [focused]);

  return (
    <TouchableOpacity style={S.tabBtn} onPress={onPress} activeOpacity={0.6}>
      <Animated.View style={[S.tabInner, { transform: [{ scale: scl }] }]}>
        <Feather name={icon} size={wp(21)} color={focused ? accent : hint} />
        <Text style={[S.tabLabel, { color: focused ? accent : hint }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const CenterBtn = memo(({ focused, onPress, accent }: any) => {
  const scl = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scl, { toValue: focused ? 0.92 : 1, useNativeDriver: true, speed: 22, bounciness: 10 }).start();
  }, [focused]);

  return (
    <TouchableOpacity style={S.centerWrap} onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[S.centerCircle, { backgroundColor: accent, transform: [{ scale: scl }] }]}>
        <Feather name="plus" size={wp(24)} color="#FFF" />
      </Animated.View>
    </TouchableOpacity>
  );
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={t.component} />)}
  </Tab.Navigator>
);

const S = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'flex-start', paddingTop: wp(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingTop: wp(2) },
  tabInner: { alignItems: 'center', height: wp(42), justifyContent: 'center' },
  tabLabel: { fontSize: fp(10), fontWeight: '500', marginTop: wp(3) },

  centerWrap: { flex: 1, alignItems: 'center', marginTop: -wp(14) },
  centerCircle: {
    width: wp(48), height: wp(48), borderRadius: wp(16),
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: wp(3) },
    shadowOpacity: 0.3, shadowRadius: wp(8), elevation: 6,
  },
});
