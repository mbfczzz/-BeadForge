import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FontSize, BorderRadius, useTheme } from '../theme';

const Tab = createBottomTabNavigator();
const { width: SW } = Dimensions.get('window');

const TABS = [
  { name: 'Home', label: '发现', icon: '🏠', component: HomeScreen },
  { name: 'Market', label: '市场', icon: '🛍', component: MarketScreen },
  { name: 'Create', label: '创作', icon: '✦', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '📤', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: '👤', component: ProfileScreen },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, dark } = useTheme();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabWidth = (SW - 32) / TABS.length;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [state.index, tabWidth, indicatorX]);

  return (
    <View style={styles.tabBarOuter}>
      <View style={[styles.tabBarInner, {
        backgroundColor: dark ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: colors.navBorder,
      }]}>
        {/* 滑动指示器 */}
        <Animated.View style={[styles.indicator, {
          width: tabWidth - 12,
          backgroundColor: colors.accent + '18',
          transform: [{ translateX: Animated.add(indicatorX, 6) }],
        }]} />

        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          const focused = state.index === index;
          const isCenter = index === 2; // 创作按钮

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <CenterTab
                key={route.key}
                icon={tab.icon}
                label={tab.label}
                focused={focused}
                onPress={onPress}
                accentColor={colors.accent}
              />
            );
          }

          return (
            <TabItem
              key={route.key}
              icon={tab.icon}
              label={tab.label}
              focused={focused}
              onPress={onPress}
              activeColor={colors.accent}
              inactiveColor={colors.textHint}
            />
          );
        })}
      </View>
    </View>
  );
}

/** 普通 Tab */
const TabItem = memo(({ icon, label, focused, onPress, activeColor, inactiveColor }: {
  icon: string; label: string; focused: boolean; onPress: () => void;
  activeColor: string; inactiveColor: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.1 : 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.timing(labelOpacity, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused, scale, labelOpacity]);

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Text style={[styles.tabIcon, { color: focused ? activeColor : inactiveColor }]}>{icon}</Text>
        <Animated.Text style={[styles.tabLabel, { color: activeColor, opacity: labelOpacity }]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

/** 中间凸起创作按钮 */
const CenterTab = memo(({ icon, label, focused, onPress, accentColor }: {
  icon: string; label: string; focused: boolean; onPress: () => void; accentColor: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.05 : 1, useNativeDriver: true, speed: 18, bounciness: 12 }),
      Animated.spring(rotate, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 15, bounciness: 8 }),
    ]).start();
  }, [focused, scale, rotate]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <TouchableOpacity style={styles.centerWrap} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.centerBtn,
        { backgroundColor: accentColor, transform: [{ scale }] },
      ]}>
        <Animated.Text style={[styles.centerIcon, { transform: [{ rotate: spin }] }]}>
          {icon}
        </Animated.Text>
      </Animated.View>
      <Text style={[styles.centerLabel, { color: focused ? accentColor : '#999' }]}>{label}</Text>
    </TouchableOpacity>
  );
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    {TABS.map((t) => (
      <Tab.Screen key={t.name} name={t.name} component={t.component} />
    ))}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 62,
    borderRadius: 24,
    borderWidth: 1,
    paddingBottom: 6,
    // 毛玻璃阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    height: 50,
    borderRadius: 18,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  tabIcon: { fontSize: 20, marginBottom: 1 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerBtn: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    // 阴影
    shadowColor: '#5B7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  centerIcon: { fontSize: 22, color: '#FFF' },
  centerLabel: { fontSize: 10, fontWeight: '600', marginTop: 3 },
});
