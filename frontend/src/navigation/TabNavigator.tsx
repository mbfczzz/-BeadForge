import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
  { name: 'Create', label: '创作', icon: 'plus', center: true },
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
      className="flex-row items-end px-6"
      style={{
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: dark ? colors.navBg : 'rgba(255,255,255,0.98)',
        borderTopWidth: 1,
        borderTopColor: colors.navBorder,
        shadowColor: dark ? '#000000' : '#0f172a',
        shadowOpacity: dark ? 0.22 : 0.06,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: -8 },
        elevation: 20,
      }}
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
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center"
              style={{ transform: [{ translateY: -18 }] }}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-full bg-blue-600"
                style={{
                  borderWidth: 4,
                  borderColor: dark ? colors.navBg : '#FFFFFF',
                  shadowColor: '#2563EB',
                  shadowOpacity: 0.34,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 12,
                }}
              >
                <Feather name="plus" size={26} color="#FFFFFF" />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} className="flex-1 items-center justify-center pb-1 pt-2">
            <Feather name={tab.icon} size={20} color={focused ? '#2563EB' : colors.textHint} />
            <Text
              className="mt-1 text-[10px]"
              style={{
                color: focused ? '#2563EB' : colors.textHint,
                fontWeight: focused ? '700' : '500',
              }}
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
