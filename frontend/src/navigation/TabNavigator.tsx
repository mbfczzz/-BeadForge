import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateScreen } from '../screens/create/CreateScreen';
import { PublishScreen } from '../screens/publish/PublishScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme, candyShadow } from '../theme';
import { wp, fp } from '../utils/responsive';
import { hapticSelection } from '../hooks/useFeedback';

const Tab = createBottomTabNavigator();

/**
 * 糖果风底 Tab — 每个 tab 选中时：
 *  - 图标放大 bounce + 上浮（spring）
 *  - pill 背景 scaleX + opacity morph
 *  - 中间创作按钮选中时额外弹跳
 * 全部用 RN 内置 Animated（Expo Go 任何版本都兼容）
 */

// 水墨国风配色（朱砂 / 竹青 / 藤黄 / 柿红 / 紫檀）
const TABS: { name: string; label: string; icon: string; color: string; center?: boolean }[] = [
  { name: 'Home',    label: '发现', icon: 'compass',       color: '#C8302B' },   // 朱砂
  { name: 'Publish', label: '动态', icon: 'zap',           color: '#4D8A5E' },   // 松绿
  { name: 'Create',  label: '创作', icon: 'plus',          color: '#CC7B3F', center: true }, // 柿红
  { name: 'Market',  label: '市场', icon: 'shopping-bag',  color: '#D4A017' },   // 藤黄
  { name: 'Profile', label: '我的', icon: 'user',          color: '#7BA4C9' },   // 天青
];

const SCREENS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen, Market: MarketScreen, Create: CreateScreen,
  Publish: PublishScreen, Profile: ProfileScreen,
};

const SPRING_OPTS = { useNativeDriver: true, damping: 14, mass: 0.7, stiffness: 220 };

/** 普通 tab 的动画容器：on 变化时弹簧图标 + pill */
const TabItem: React.FC<{
  on: boolean;
  color: string;
  icon: string;
  label: string;
  tintColor: string;
  onPress: () => void;
}> = ({ on, color, icon, label, tintColor, onPress }) => {
  const iconScale = useRef(new Animated.Value(on ? 1.15 : 1)).current;
  const iconTY = useRef(new Animated.Value(on ? -2 : 0)).current;
  const pillScaleX = useRef(new Animated.Value(on ? 1 : 0.5)).current;
  const pillOpacity = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, { ...SPRING_OPTS, toValue: on ? 1.15 : 1, stiffness: 260, damping: 10 }),
      Animated.spring(iconTY, { ...SPRING_OPTS, toValue: on ? -2 : 0, stiffness: 260, damping: 10 }),
      Animated.spring(pillScaleX, { ...SPRING_OPTS, toValue: on ? 1 : 0.5, stiffness: 200 }),
      Animated.spring(pillOpacity, { ...SPRING_OPTS, toValue: on ? 1 : 0, stiffness: 200 }),
    ]).start();
  }, [on, iconScale, iconTY, pillScaleX, pillOpacity]);

  return (
    <Pressable onPress={onPress} style={$.tab}>
      <View style={$.pillCenter} pointerEvents="none">
        <Animated.View
          style={[
            $.activePill,
            { backgroundColor: color + '26', opacity: pillOpacity, transform: [{ scaleX: pillScaleX }] },
          ]}
        />
      </View>
      <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconTY }] }}>
        <Feather name={icon as any} size={wp(21)} color={tintColor} />
      </Animated.View>
      <Text style={[$.label, { color: tintColor, fontWeight: on ? '700' : '500' }]}>
        {label}
      </Text>
    </Pressable>
  );
};

/** 中间创作按钮 */
const CenterItem: React.FC<{
  on: boolean;
  color: string;
  label: string;
  tintColor: string;
  dark: boolean;
  surface: string;
  onPress: () => void;
}> = ({ on, color, label, tintColor, dark, surface, onPress }) => {
  const outerScale = useRef(new Animated.Value(on ? 1.08 : 1)).current;
  const innerScale = useRef(new Animated.Value(on ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(outerScale, { ...SPRING_OPTS, toValue: on ? 1.08 : 1, stiffness: 180, damping: 12 }),
      Animated.spring(innerScale, { ...SPRING_OPTS, toValue: on ? 1 : 0.95, damping: 10 }),
    ]).start();
  }, [on, outerScale, innerScale]);

  return (
    <Pressable onPress={onPress} style={$.centerWrap}>
      <Animated.View
        style={[
          $.centerOuter,
          { backgroundColor: surface, borderColor: dark ? '#3A2A44' : '#FFEDE2', transform: [{ scale: outerScale }] },
        ]}
      >
        <Animated.View
          style={[
            $.centerInner,
            { backgroundColor: color, transform: [{ scale: innerScale }] },
            candyShadow(color, 'md'),
          ]}
        >
          <Feather name="plus" size={wp(22)} color="#fff" />
        </Animated.View>
      </Animated.View>
      <Text style={[$.centerLabel, { color: tintColor, fontWeight: on ? '700' : '500' }]}>
        {label}
      </Text>
    </Pressable>
  );
};

function CustomTabBar({ state, navigation }: any) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        $.bar,
        {
          paddingBottom: Math.max(insets.bottom, wp(4)),
          backgroundColor: colors.navBg,
          borderTopColor: colors.navBorder,
        },
      ]}
    >
      {state.routes.map((route: any, idx: number) => {
        const tab = TABS[idx];
        const on = state.index === idx;
        const go = () => { if (!on) { hapticSelection(); navigation.navigate(route.name); } };
        const tintColor = on ? tab.color : colors.textHint;

        if (tab.center) {
          return (
            <CenterItem
              key={route.key}
              on={on}
              color={tab.color}
              label={tab.label}
              tintColor={tintColor}
              dark={dark}
              surface={colors.surface}
              onPress={go}
            />
          );
        }
        return (
          <TabItem
            key={route.key}
            on={on}
            color={tab.color}
            icon={tab.icon}
            label={tab.label}
            tintColor={tintColor}
            onPress={go}
          />
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map((t) => <Tab.Screen key={t.name} name={t.name} component={SCREENS[t.name]} />)}
  </Tab.Navigator>
);

const $ = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingTop: wp(6),
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // 普通 tab
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: wp(6),
  },
  pillCenter: {
    position: 'absolute', top: wp(2),
    left: 0, right: 0, alignItems: 'center',
  },
  activePill: {
    width: wp(44), height: wp(30), borderRadius: wp(15),
  },
  label: {
    fontSize: fp(10), marginTop: wp(3), letterSpacing: 0.3,
  },

  // 中间创作按钮
  centerWrap: {
    flex: 1, alignItems: 'center',
    marginTop: -wp(18),
  },
  centerOuter: {
    width: wp(56), height: wp(56), borderRadius: wp(28),
    borderWidth: wp(3), justifyContent: 'center', alignItems: 'center',
  },
  centerInner: {
    width: wp(42), height: wp(42), borderRadius: wp(21),
    justifyContent: 'center', alignItems: 'center',
  },
  centerLabel: {
    fontSize: fp(10), marginTop: wp(3), letterSpacing: 0.3,
  },
});
