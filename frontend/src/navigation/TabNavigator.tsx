import React, { memo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
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
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
  const liftY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: focused ? 1 : 0.5, duration: 200, useNativeDriver: true }).start();
  }, [focused]);

  const onHoverIn = useCallback(() => {
    Animated.spring(liftY, { toValue: -wp(2), useNativeDriver: true, speed: 22, bounciness: 6 }).start();
  }, [liftY]);
  const onHoverOut = useCallback(() => {
    Animated.spring(liftY, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, [liftY]);

  return (
    <Pressable style={[S.tab, { cursor: 'pointer' } as any]} onPress={onPress}
      onHoverIn={Platform.OS === 'web' ? onHoverIn : undefined}
      onHoverOut={Platform.OS === 'web' ? onHoverOut : undefined}>
      <Animated.View style={[S.tabInner, { opacity, transform: [{ translateY: liftY }] }]}>
        <Feather name={icon} size={wp(20)} color={focused ? activeColor : inactiveColor} />
        <Text style={[S.tabLabel, { color: focused ? activeColor : inactiveColor }]}>{label}</Text>
      </Animated.View>
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  tab: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center' },
  tabLabel: { fontSize: fp(10), fontWeight: '500', marginTop: wp(3) },
});
