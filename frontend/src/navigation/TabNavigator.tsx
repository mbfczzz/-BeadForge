import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { hapticSelection } from '../hooks/useFeedback';
import { useNavigationUIStore } from '../store/useNavigationUIStore';
import { useTheme } from '../theme';

const Tab = createBottomTabNavigator();

const TABS: {
  name: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  center?: boolean;
}[] = [
  { name: 'Home', label: '发现', icon: 'compass' },
  { name: 'Publish', label: '动态', icon: 'activity' },
  { name: 'Create', label: '发布', icon: 'plus', center: true },
  { name: 'Market', label: '商城', icon: 'shopping-bag' },
  { name: 'Profile', label: '我的', icon: 'user' },
];

const SCREENS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen,
  Publish: PublishScreen,
  Create: CreateScreen,
  Market: MarketScreen,
  Profile: ProfileScreen,
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { dark, colors } = useTheme();
  const tabBarHidden = useNavigationUIStore((store) => store.tabBarHidden);

  if (tabBarHidden) {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: dark ? colors.navBg : 'rgba(255,255,255,0.98)',
          borderTopColor: colors.navBorder,
          shadowColor: dark ? '#020617' : '#1E3A8A',
          shadowOpacity: dark ? 0.26 : 0.08,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index];
        const focused = state.index === index;

        const onPress = () => {
          hapticSelection();
          navigation.navigate(route.name);
        };

        if (tab.center) {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.centerTab}>
              <View
                style={[
                  styles.centerButton,
                  {
                    borderColor: dark ? colors.navBg : '#FFFFFF',
                  },
                ]}
              >
                <Feather name="plus" size={26} color="#FFFFFF" />
              </View>
              <Text style={[styles.centerLabel, { color: focused ? '#2563EB' : colors.textHint }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabButton}>
            <Feather name={tab.icon} size={20} color={focused ? '#2563EB' : colors.textHint} />
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? '#2563EB' : colors.textHint, fontWeight: focused ? '700' : '500' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((tab) => (
      <Tab.Screen key={tab.name} name={tab.name} component={SCREENS[tab.name]} />
    ))}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    transform: [{ translateY: -14 }],
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B6CFF',
    borderWidth: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  centerLabel: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '700',
  },
});
