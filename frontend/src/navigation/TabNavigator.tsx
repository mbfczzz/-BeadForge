import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, FontSize } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: '发现', icon: '◉', component: HomeScreen },
  { name: 'Create', label: '创作', icon: '✏️', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '▲', component: PublishScreen },
  { name: 'Market', label: '市场', icon: '◎', component: MarketScreen },
  { name: 'Profile', label: '我的', icon: '☰', component: ProfileScreen },
];

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.black,
      tabBarInactiveTintColor: Colors.gray,
      tabBarLabelStyle: styles.label,
      tabBarStyle: styles.tabBar,
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
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, { color: focused ? Colors.black : Colors.gray }]}>{t.icon}</Text>
          ),
        }}
      />
    ))}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 56,
    paddingBottom: 4,
    paddingTop: 4,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBg,
    elevation: 0,
  },
  label: { fontSize: FontSize.xs, fontWeight: '500' },
  icon: { fontSize: 20 },
});
