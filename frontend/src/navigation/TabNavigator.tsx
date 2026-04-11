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

/**
 * 自定义线条图标组件 - 用 View 绘制简洁一致的图标
 */
const LineIcon = memo(({ type, color, size = wp(22) }: { type: string; color: string; size?: number }) => {
  const t = size * 0.1; // 线条粗细

  switch (type) {
    case 'home':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {/* 屋顶三角 */}
          <View style={{
            width: 0, height: 0,
            borderLeftWidth: size * 0.45, borderRightWidth: size * 0.45,
            borderBottomWidth: size * 0.35,
            borderLeftColor: 'transparent', borderRightColor: 'transparent',
            borderBottomColor: color,
            marginBottom: -1,
          }} />
          {/* 房体 */}
          <View style={{
            width: size * 0.65, height: size * 0.4,
            borderWidth: t, borderColor: color, borderTopWidth: 0,
            borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06,
          }} />
        </View>
      );
    case 'market':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {/* 购物袋 */}
          <View style={{
            width: size * 0.55, height: size * 0.5,
            borderWidth: t, borderColor: color,
            borderRadius: size * 0.06,
            borderTopLeftRadius: 0, borderTopRightRadius: 0,
          }} />
          {/* 提手 */}
          <View style={{
            position: 'absolute', top: size * 0.12,
            width: size * 0.35, height: size * 0.22,
            borderWidth: t, borderColor: color,
            borderRadius: size * 0.18,
            borderBottomWidth: 0,
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
          }} />
        </View>
      );
    case 'publish':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {/* 向上箭头 */}
          <View style={{
            width: 0, height: 0,
            borderLeftWidth: size * 0.22, borderRightWidth: size * 0.22,
            borderBottomWidth: size * 0.25,
            borderLeftColor: 'transparent', borderRightColor: 'transparent',
            borderBottomColor: color,
            marginBottom: -1,
          }} />
          {/* 竖线 */}
          <View style={{ width: t, height: size * 0.28, backgroundColor: color }} />
          {/* 底部托盘 */}
          <View style={{
            width: size * 0.6, height: t, backgroundColor: color,
            marginTop: size * 0.05,
          }} />
        </View>
      );
    case 'profile':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {/* 头 */}
          <View style={{
            width: size * 0.3, height: size * 0.3,
            borderRadius: size * 0.15,
            borderWidth: t, borderColor: color,
          }} />
          {/* 身体 */}
          <View style={{
            width: size * 0.5, height: size * 0.22,
            borderWidth: t, borderColor: color,
            borderRadius: size * 0.25,
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            marginTop: size * 0.04,
          }} />
        </View>
      );
    default:
      return <Text style={{ fontSize: size * 0.8, color }}>?</Text>;
  }
});

const TABS = [
  { name: 'Home', label: '发现', iconType: 'home', component: HomeScreen },
  { name: 'Market', label: '市场', iconType: 'market', component: MarketScreen },
  { name: 'Create', label: '', iconType: 'create', component: CreateScreen },
  { name: 'Publish', label: '发布', iconType: 'publish', component: PublishScreen },
  { name: 'Profile', label: '我的', iconType: 'profile', component: ProfileScreen },
];

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, wp(6));

  return (
    <View style={[S.bar, {
      paddingBottom: bottomPad,
      backgroundColor: dark ? 'rgba(12,12,29,0.98)' : 'rgba(255,255,255,0.98)',
      borderTopColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
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
            iconType={tab.iconType}
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

const TabBtn = memo(({ iconType, label, focused, onPress, accent, hint }: {
  iconType: string; label: string; focused: boolean; onPress: () => void;
  accent: string; hint: string;
}) => {
  const animY = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animY, { toValue: focused ? -wp(1) : 0, useNativeDriver: true, speed: 25, bounciness: 10 }),
      Animated.spring(pillW, { toValue: focused ? 1 : 0, useNativeDriver: false, speed: 18, bounciness: 4 }),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity style={S.tabBtn} onPress={onPress} activeOpacity={0.6}>
      <Animated.View style={[S.tabInner, { transform: [{ translateY: animY }] }]}>
        <LineIcon type={iconType} color={focused ? accent : hint} />
        <Text style={[S.tabLabel, { color: focused ? accent : hint, opacity: focused ? 1 : 0.7 }]}>
          {label}
        </Text>
      </Animated.View>
      <Animated.View style={[S.pill, {
        width: pillW.interpolate({ inputRange: [0, 1], outputRange: [0, wp(20)] }),
        backgroundColor: accent,
      }]} />
    </TouchableOpacity>
  );
});

const CenterButton = memo(({ focused, onPress, accent }: {
  focused: boolean; onPress: () => void; accent: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 0.93 : 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  }, [focused]);

  return (
    <TouchableOpacity style={S.centerWrap} onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[S.centerCircle, { backgroundColor: accent, transform: [{ scale }] }]}>
        {/* 十字线条 */}
        <View style={S.plusH} />
        <View style={S.plusV} />
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },

  tabBtn: { flex: 1, alignItems: 'center', paddingTop: wp(3) },
  tabInner: { alignItems: 'center', height: wp(40), justifyContent: 'center' },
  tabLabel: { fontSize: fp(10), fontWeight: '600', marginTop: wp(3), letterSpacing: 0.2 },
  pill: {
    height: wp(2.5), borderRadius: wp(1.25), marginTop: wp(4),
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 3,
  },

  centerWrap: { flex: 1, alignItems: 'center', marginTop: -wp(16) },
  centerCircle: {
    width: wp(48), height: wp(48), borderRadius: wp(24),
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: wp(3) },
    shadowOpacity: 0.3, shadowRadius: wp(8), elevation: 8,
  },
  plusH: {
    position: 'absolute',
    width: wp(18), height: wp(2.5),
    backgroundColor: '#FFF', borderRadius: wp(1.25),
  },
  plusV: {
    position: 'absolute',
    width: wp(2.5), height: wp(18),
    backgroundColor: '#FFF', borderRadius: wp(1.25),
  },
});
