import './global.css';
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProviderRaw } from 'heroui-native/provider-raw';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DesignDetailScreen } from './src/screens/detail/DesignDetailScreen';
import { EditorScreen } from './src/screens/create/EditorScreen';
import { FeedDetailScreen } from './src/screens/publish/FeedDetailScreen';
import { UserProfileScreen } from './src/screens/publish/UserProfileScreen';
import { ProductDetailScreen } from './src/screens/market/ProductDetailScreen';
import type { RootStackParamList } from './src/navigation/types';
import { useAuthStore } from './src/store/useAuthStore';
import { ThemeProvider, useTheme } from './src/theme';
import { injectWebHoverStyles } from './src/utils/webHover';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const loadToken = useAuthStore((state) => state.loadToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { colors, dark } = useTheme();

  useEffect(() => {
    void loadToken();
    injectWebHoverStyles();
  }, [loadToken]);

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
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <HeroUINativeProviderRaw>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </HeroUINativeProviderRaw>
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
