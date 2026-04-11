import React, { memo, useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FontSize, BorderRadius, useTheme } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: '发现', icon: '◉', component: HomeScreen },
  { name: 'Create', label: '创作', icon: '✦', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '△', component: PublishScreen },
  { name: 'Market', label: '市场', icon: '◈', component: MarketScreen },
  { name: 'Profile', label: '我的', icon: '◎', component: ProfileScreen },
];

/** Tab 图标 - 带缩放动画 */
const TabIcon = memo(({ icon, focused, color }: { icon: string; focused: boolean; color: string }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
    </Animated.View>
  );
});

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textHint,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          height: 58, paddingBottom: 6, paddingTop: 2,
          backgroundColor: colors.navBg,
          borderTopWidth: 1, borderTopColor: colors.navBorder,
          elevation: 0,
        },
        headerShown: false,
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarLabel: t.label,
            tabBarIcon: ({ color, focused }) => <TabIcon icon={t.icon} focused={focused} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: FontSize.xs, fontWeight: '500' },
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 28 },
  icon: { fontSize: 20 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
});
