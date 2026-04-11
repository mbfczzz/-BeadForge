import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, FontSize, BorderRadius } from '../theme';

const Tab = createBottomTabNavigator();

const TABS: { name: string; label: string; icon: string; component: React.ComponentType<any> }[] = [
  { name: 'Home', label: '首页', icon: '🏠', component: HomeScreen },
  { name: 'Create', label: '创作', icon: '✏️', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '🚀', component: PublishScreen },
  { name: 'Market', label: '市场', icon: '🛍️', component: MarketScreen },
  { name: 'Profile', label: '个人', icon: '🦉', component: ProfileScreen },
];

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.grayLight,
      tabBarLabelStyle: styles.tabLabel,
      tabBarStyle: styles.tabBar,
      headerShown: false,
    }}
  >
    {TABS.map((tab) => (
      <Tab.Screen
        key={tab.name}
        name={tab.name}
        component={tab.component}
        options={{
          tabBarLabel: tab.label,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={[styles.icon, focused && styles.iconActive]}>{tab.icon}</Text>
            </View>
          ),
        }}
      />
    ))}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: Colors.white,
    borderTopWidth: 2,
    borderTopColor: Colors.grayBg,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.primary + '18',
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
    fontSize: 22,
  },
});
