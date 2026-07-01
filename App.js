import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { initI18n } from './src/i18n';
import StorageService from './src/services/StorageService';
import AdService from './src/services/AdService';
import PremiumService from './src/services/PremiumService';
import SoundService from './src/services/SoundService';
import { Colors } from './src/styles/GlobalStyles';
import Navigation from './src/navigation';
import { AppContext } from './src/context/AppContext';
import AppLogo from './src/components/AppLogo';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      await initI18n();
      const settings = await StorageService.getSettings();
      setIsOnboarding(!settings.onboardingDone);
      await AdService.initialize();
      await PremiumService.initIAP();
      SoundService.preload();
    } catch (e) {
      console.error('[App] Bootstrap error:', e);
    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleOnboardingDone = () => {
    setIsOnboarding(false);
  };

  const handleDataReset = useCallback(async () => {
    setAppReady(false);
    await bootstrap();
  }, [bootstrap]);

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <AppLogo size="lg" />
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContext.Provider value={{ onDataReset: handleDataReset }}>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <Navigation
            isOnboarding={isOnboarding}
            onOnboardingDone={handleOnboardingDone}
          />
        </AppContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loader: {
    marginTop: 8,
  },
});
