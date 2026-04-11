import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FontSize, useTheme } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: '发现', icon: '◉', component: HomeScreen },
  { name: 'Create', label: '创作', icon: '✦', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '△', component: PublishScreen },
  { name: 'Market', label: '市场', icon: '◈', component: MarketScreen },
  { name: 'Profile', label: '我的', icon: '◎', component: ProfileScreen },
];

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textHint,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '500' },
        tabBarStyle: {
          height: 56, paddingBottom: 4, paddingTop: 4,
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
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>{t.icon}</Text>,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
