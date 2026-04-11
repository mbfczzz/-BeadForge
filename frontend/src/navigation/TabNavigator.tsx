import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BorderRadius, useTheme } from '../theme';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../utils/responsive';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: '发现', icon: '🏠', component: HomeScreen },
  { name: 'Market', label: '市场', icon: '🛍', component: MarketScreen },
  { name: 'Create', label: '创作', icon: '✦', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '📤', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: '👤', component: ProfileScreen },
];

const TAB_H = wp(56);
const TAB_MARGIN = wp(16);
const TAB_RADIUS = wp(24);
const CENTER_SIZE = wp(50);
const CENTER_RADIUS = wp(18);
const CENTER_LIFT = wp(20);

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabWidth = (screenW - TAB_MARGIN * 2) / TABS.length;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true, speed: 20, bounciness: 8,
    }).start();
  }, [state.index, tabWidth, indicatorX]);

  return (
    <View style={[styles.tabOuter, { bottom: wp(10) + BOTTOM_SAFE_H }]}>
      <View style={[styles.tabInner, {
        backgroundColor: dark ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: colors.navBorder,
      }]}>
        <Animated.View style={[styles.indicator, {
          width: tabWidth - wp(12),
          backgroundColor: colors.accent + '18',
          transform: [{ translateX: Animated.add(indicatorX, wp(6)) }],
        }]} />

        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          const focused = state.index === index;
          const isCenter = index === 2;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return isCenter
            ? <CenterTab key={route.key} icon={tab.icon} label={tab.label} focused={focused} onPress={onPress} accentColor={colors.accent} />
            : <TabItem key={route.key} icon={tab.icon} label={tab.label} focused={focused} onPress={onPress} activeColor={colors.accent} inactiveColor={colors.textHint} />;
        })}
      </View>
    </View>
  );
}

const TabItem = memo(({ icon, label, focused, onPress, activeColor, inactiveColor }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.1 : 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.timing(labelOpacity, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Text style={[styles.tabIcon, { color: focused ? activeColor : inactiveColor }]}>{icon}</Text>
        <Animated.Text style={[styles.tabLabel, { color: activeColor, opacity: labelOpacity }]}>{label}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const CenterTab = memo(({ icon, label, focused, onPress, accentColor }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.05 : 1, useNativeDriver: true, speed: 18, bounciness: 12 }),
      Animated.spring(rotate, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 15, bounciness: 8 }),
    ]).start();
  }, [focused]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <TouchableOpacity style={styles.centerWrap} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.centerBtn, { backgroundColor: accentColor, transform: [{ scale }] }]}>
        <Animated.Text style={[styles.centerIcon, { transform: [{ rotate: spin }] }]}>{icon}</Animated.Text>
      </Animated.View>
      <Text style={[styles.centerLabel, { color: focused ? accentColor : '#999' }]}>{label}</Text>
    </TouchableOpacity>
  );
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={t.component} />)}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabOuter: { position: 'absolute', left: TAB_MARGIN, right: TAB_MARGIN },
  tabInner: {
    flexDirection: 'row', alignItems: 'flex-end', height: TAB_H,
    borderRadius: TAB_RADIUS, borderWidth: 1, paddingBottom: wp(6),
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12, overflow: 'hidden',
  },
  indicator: { position: 'absolute', bottom: wp(4), height: wp(50), borderRadius: wp(18) },

  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: wp(52) },
  tabIcon: { fontSize: fp(20), marginBottom: 1 },
  tabLabel: { fontSize: fp(10), fontWeight: '600', marginTop: 1 },

  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  centerBtn: {
    width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_RADIUS,
    justifyContent: 'center', alignItems: 'center', marginTop: -CENTER_LIFT,
    shadowColor: '#5B7FFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },
  centerIcon: { fontSize: fp(22), color: '#FFF' },
  centerLabel: { fontSize: fp(10), fontWeight: '600', marginTop: wp(3) },
});
