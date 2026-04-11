import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './src/navigation/TabNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { Colors, FontSize } from './src/theme';

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashEmoji}>🧩</Text>
      <Text style={styles.splashTitle}>BeadForge</Text>
      <Text style={styles.splashSub}>拼豆创作平台</Text>
      <ActivityIndicator color={Colors.white} size="large" style={styles.loader} />
    </View>
  );
}

export default function App() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => { loadToken(); }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashEmoji: { fontSize: 80, marginBottom: 16 },
  splashTitle: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.white },
  splashSub: { fontSize: FontSize.lg, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  loader: { marginTop: 32 },
});
