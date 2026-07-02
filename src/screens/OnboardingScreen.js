import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Shadows,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import AppLogo from '../components/AppLogo';
import { getAvatarColor } from '../utils/playerAvatar';
import { isDuplicatePlayerName } from '../utils/playerNames';

export default function OnboardingScreen({ onDone }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('onboarding.nameRequired'));
      return;
    }
    if (!kvkkAccepted) {
      Alert.alert(t('common.error'), t('onboarding.kvkkRequired'));
      return;
    }
    const existingPlayers = await StorageService.getPlayers();
    if (isDuplicatePlayerName(name, existingPlayers)) {
      Alert.alert(t('common.error'), t('players.nameTaken'));
      return;
    }
    setLoading(true);
    try {
      const mainUser = {
        id: GameService.generateId(),
        name: name.trim(),
        color: getAvatarColor(name.trim()),
        isMainUser: true,
        createdAt: new Date().toISOString(),
      };
      await StorageService.saveMainUser(mainUser);
      await StorageService.addPlayer(mainUser);
      await StorageService.saveSettings({ onboardingDone: true, kvkkAccepted: true });
      onDone?.();
    } catch {
      setLoading(false);
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area */}
          <View style={styles.logoContainer}>
            <AppLogo size="lg" />
            <Text style={styles.tagline}>{t('onboarding.welcome')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
            <Text style={styles.valueProp}>{t('onboarding.valueProp')}</Text>
          </View>

          {/* Name input */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('onboarding.yourName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={30}
            />
            <Text style={styles.hint}>{t('onboarding.nameHint')}</Text>
          </View>

          {/* Entertainment disclaimer */}
          <View style={styles.entertainmentCard}>
            <View style={styles.kvkkHeader}>
              <MaterialCommunityIcons
                name="party-popper"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.kvkkTitle}>{t('onboarding.entertainmentTitle')}</Text>
            </View>
            <Text style={styles.kvkkText}>{t('onboarding.entertainmentText')}</Text>
          </View>

          {/* KVKK */}
          <View style={styles.kvkkCard}>
            <View style={styles.kvkkHeader}>
              <MaterialCommunityIcons
                name="shield-lock"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.kvkkTitle}>{t('onboarding.kvkkTitle')}</Text>
            </View>
            <Text style={styles.kvkkText}>{t('onboarding.kvkkText')}</Text>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setKvkkAccepted(!kvkkAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, kvkkAccepted && styles.checkboxChecked]}>
                {kvkkAccepted && (
                  <MaterialCommunityIcons name="check" size={14} color={Colors.background} />
                )}
              </View>
              <Text style={styles.checkLabel}>{t('onboarding.kvkkAccept')}</Text>
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[Buttons.primary, styles.cta, (!name.trim() || !kvkkAccepted) && styles.ctaDisabled]}
            onPress={handleStart}
            disabled={loading || !name.trim() || !kvkkAccepted}
            activeOpacity={0.85}
          >
            <Text style={Buttons.primaryText}>{t('onboarding.letsGo')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.primary,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  valueProp: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.primary,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.h4,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  hint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  kvkkCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  entertainmentCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    marginBottom: Spacing.lg,
  },
  kvkkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  kvkkTitle: {
    ...Typography.h4,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  kvkkText: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkLabel: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  cta: {
    marginTop: Spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
});
