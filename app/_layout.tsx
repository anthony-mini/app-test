import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import AdBanner from '@/components/AdBanner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAdBanner } from '@/hooks/useAdBanner';
import DatabaseService from '@/services/DatabaseService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const { showAd, closeAd } = useAdBanner();

  useEffect(() => {
    DatabaseService.initialize()
      .then(() => setIsDbReady(true))
      .catch((error) => {
        if (__DEV__) console.error('Failed to initialize database:', error);
        setIsDbReady(true);
      });
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(vacation)" options={{ headerShown: false }} />
        <Stack.Screen name="(chat)" options={{ headerShown: false }} />
        <Stack.Screen name="(adv)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {showAd && <AdBanner onClose={closeAd} />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
