import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DesignDetailScreen } from './src/screens/detail/DesignDetailScreen';
import { EditorScreen } from './src/screens/create/EditorScreen';
import { FeedDetailScreen } from './src/screens/publish/FeedDetailScreen';
import { UserProfileScreen } from './src/screens/publish/UserProfileScreen';
import type { RootStackParamList } from './src/navigation/types';
import { useAuthStore } from './src/store/useAuthStore';
import { ThemeProvider, useTheme } from './src/theme';
import { injectWebHoverStyles } from './src/utils/webHover';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { colors, dark } = useTheme();

  useEffect(() => { loadToken(); injectWebHoverStyles(); }, []);

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
