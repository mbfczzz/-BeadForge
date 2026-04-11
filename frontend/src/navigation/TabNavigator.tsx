import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme } from '../theme';
import { wp, fp } from '../utils/responsive';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: '发现', icon: '🏠', component: HomeScreen },
  { name: 'Market', label: '市场', icon: '🛍', component: MarketScreen },
  { name: 'Create', label: '', icon: '➕', component: CreateScreen },
  { name: 'Publish', label: '发布', icon: '📤', component: PublishScreen },
  { name: 'Profile', label: '我的', icon: '👤', component: ProfileScreen },
];

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, wp(8));

  return (
    <View style={[S.bar, {
      paddingBottom: bottomPad,
      backgroundColor: dark ? '#12122A' : '#FFFFFF',
      borderTopColor: colors.divider,
    }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index];
        const focused = state.index === index;
        const isCenter = index === 2;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (isCenter) {
          return <CenterButton key={route.key} focused={focused} onPress={onPress} accent={colors.accent} />;
        }

        return (
          <TabBtn
            key={route.key}
            icon={tab.icon}
            label={tab.label}
            focused={focused}
            onPress={onPress}
            accent={colors.accent}
            hint={colors.textHint}
          />
        );
      })}
    </View>
  );
}

/** 普通 Tab 按钮 */
const TabBtn = memo(({ icon, label, focused, onPress, accent, hint }: {
  icon: string; label: string; focused: boolean; onPress: () => void;
  accent: string; hint: string;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: focused ? -wp(2) : 0, useNativeDriver: true, speed: 25, bounciness: 12 }),
      Animated.spring(pillW, { toValue: focused ? 1 : 0, useNativeDriver: false, speed: 20, bounciness: 6 }),
    ]).start();
  }, [focused]);

  const pillWidth = pillW.interpolate({ inputRange: [0, 1], outputRange: [0, wp(36)] });

  return (
    <TouchableOpacity style={S.tabBtn} onPress={onPress} activeOpacity={0.6}>
      <Animated.View style={[S.tabInner, { transform: [{ translateY }] }]}>
        <Text style={[S.tabIcon, { color: focused ? accent : hint }]}>{icon}</Text>
        <Text style={[S.tabLabel, { color: focused ? accent : hint }]}>{label}</Text>
      </Animated.View>
      {/* 底部指示条 */}
      <Animated.View style={[S.pill, { width: pillWidth, backgroundColor: accent }]} />
    </TouchableOpacity>
  );
});

/** 中间创作按钮 - 圆形凸起 */
const CenterButton = memo(({ focused, onPress, accent }: {
  focused: boolean; onPress: () => void; accent: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 0.92 : 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  }, [focused]);

  return (
    <TouchableOpacity style={S.centerWrap} onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[S.centerCircle, {
        backgroundColor: accent,
        transform: [{ scale }],
      }]}>
        <Text style={S.centerPlus}>＋</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={t.component} />)}
  </Tab.Navigator>
);

const S = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: wp(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },

  // 普通 Tab
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingTop: wp(4),
  },
  tabInner: { alignItems: 'center' },
  tabIcon: { fontSize: fp(20), height: wp(26), textAlign: 'center' },
  tabLabel: { fontSize: fp(10), fontWeight: '600', marginTop: wp(2), letterSpacing: 0.3 },
  pill: {
    height: wp(3),
    borderRadius: wp(1.5),
    marginTop: wp(5),
    // 指示条也有微光
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },

  // 中间按钮
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -wp(18),
  },
  centerCircle: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
    // 双层阴影: 近处接触阴影 + 远处扩散光晕
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: wp(3) },
    shadowOpacity: 0.3,
    shadowRadius: wp(8),
    elevation: 8,
    // 微妙边框增加厚度感
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  centerPlus: {
    fontSize: fp(24),
    color: '#FFF',
    fontWeight: '300',
    marginTop: -wp(1),
  },
});
