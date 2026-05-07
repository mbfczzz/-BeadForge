import './global.css';
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DesignDetailScreen } from './src/screens/detail/DesignDetailScreen';
import { EditorScreen } from './src/screens/create/EditorScreen';
import { FeedDetailScreen } from './src/screens/publish/FeedDetailScreen';
import { PublishComposerScreen } from './src/screens/publish/PublishComposerScreen';
import { UserProfileScreen } from './src/screens/publish/UserProfileScreen';
import { DirectMessageScreen } from './src/screens/publish/DirectMessageScreen';
import { ProductDetailScreen } from './src/screens/market/ProductDetailScreen';
import { CartScreen } from './src/screens/market/CartScreen';
import { PaymentScreen } from './src/screens/market/PaymentScreen';
import { ResourceDetailScreen } from './src/screens/detail/ResourceDetailScreen';
import { BannerDetailScreen } from './src/screens/detail/BannerDetailScreen';
import { AddressManageScreen } from './src/screens/profile/AddressManageScreen';
import { AppAlertProvider } from './src/components/common/AppAlertProvider';
import type { RootStackParamList } from './src/navigation/types';
import { useAuthStore } from './src/store/useAuthStore';
import { useUiConfigStore } from './src/store/useUiConfigStore';
import { ThemeProvider, useTheme } from './src/theme';
import { injectWebHoverStyles } from './src/utils/webHover';
import { getOrCreateDeviceId, describeDeviceName } from './src/utils/deviceId';
import { userSessionApi } from './src/api/security';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const loadToken = useAuthStore((state) => state.loadToken);
  const userId = useAuthStore((state) => state.user?.id);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadUiConfig = useUiConfigStore((state) => state.load);
  const { colors, dark } = useTheme();

  useEffect(() => {
    void loadToken();
    void loadUiConfig();
    injectWebHoverStyles();
  }, [loadToken, loadUiConfig]);

  // 登录后上报设备，让设置页能看到当前设备
  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        await userSessionApi.heartbeat(deviceId, describeDeviceName());
      } catch {
        // 静默失败，不影响主流程
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const applyNavigationBarTheme = async () => {
      await NavigationBar.setButtonStyleAsync(dark ? 'light' : 'dark');
    };

    void applyNavigationBarTheme();
  }, [dark]);

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="DesignDetail" component={DesignDetailScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
        <Stack.Screen name="PublishComposer" component={PublishComposerScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="DirectMessage" component={DirectMessageScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="AddressManage" component={AddressManageScreen} />
        <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
        <Stack.Screen name="BannerDetail" component={BannerDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppAlertProvider>
            <AppContent />
          </AppAlertProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
