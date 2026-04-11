import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, FontSize } from '../theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Create: '🎨',
  Publish: '📤',
  Market: '🛒',
  Profile: '👤',
};

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
          {TAB_ICONS[route.name]}
        </Text>
      ),
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray,
      tabBarLabelStyle: styles.tabLabel,
      tabBarStyle: styles.tabBar,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
    <Tab.Screen name="Create" component={CreateScreen} options={{ tabBarLabel: '创作' }} />
    <Tab.Screen name="Publish" component={PublishScreen} options={{ tabBarLabel: '发布' }} />
    <Tab.Screen name="Market" component={MarketScreen} options={{ tabBarLabel: '市场' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '个人' }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
    backgroundColor: Colors.white,
    borderTopColor: Colors.grayBg,
  },
  tabLabel: {
    fontSize: FontSize.xs,
  },
});
