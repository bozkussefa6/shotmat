import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Layout,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import Constants from 'expo-constants';
import { changeLanguage } from '../i18n';
import ScreenHeader from '../components/ScreenHeader';
import { useAppContext } from '../context/AppContext';

const MODES = ['system_only', 'mixed', 'user_first', 'system_random'];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { onDataReset } = useAppContext();
  const [settings, setSettings] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    StorageService.getSettings().then(setSettings);
  }, []);

  const handleLanguage = async (lang) => {
    await changeLanguage(lang);
    await StorageService.saveSettings({ language: lang });
    setSettings((s) => ({ ...s, language: lang }));
  };

  const handleMode = async (mode) => {
    await StorageService.saveSettings({ questionMode: mode });
    setSettings((s) => ({ ...s, questionMode: mode }));
  };

  const handleSoundToggle = async (value) => {
    await StorageService.saveSettings({ soundEnabled: value });
    setSettings((s) => ({ ...s, soundEnabled: value }));
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.resetData'),
      `${t('settings.resetDataConfirm')}\n\n${t('settings.resetDataWarning')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.resetData'),
          style: 'destructive',
          onPress: async () => {
            await StorageService.resetAll();
            await onDataReset();
            navigation.popToTop();
          },
        },
      ]
    );
  };

  const modeKey = (mode) => {
    const map = {
      system_only: 'modeSystemOnly',
      mixed: 'modeMixed',
      user_first: 'modeUserFirst',
      system_random: 'modeSystemRandom',
    };
    return map[mode];
  };

  const soundOn = settings?.soundEnabled !== false;

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader title={t('settings.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.section}>
          {['tr', 'en'].map((lang) => {
            const active = (settings?.language || i18n.language) === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => handleLanguage(lang)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionEmoji}>{lang === 'tr' ? '🇹🇷' : '🇬🇧'}</Text>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {t(`settings.language${lang.charAt(0).toUpperCase()}${lang.slice(1)}`)}
                </Text>
                {active && <MaterialCommunityIcons name="check" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t('settings.sound')}</Text>
        <View style={styles.section}>
          <View style={styles.option}>
            <MaterialCommunityIcons name="volume-high" size={18} color={Colors.textSecondary} />
            <Text style={styles.optionText}>{t('settings.sound')}</Text>
            <Switch
              value={soundOn}
              onValueChange={handleSoundToggle}
              trackColor={{ false: Colors.border, true: Colors.primary + '88' }}
              thumbColor={soundOn ? Colors.primary : Colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('settings.defaultQuestionMode')}</Text>
        <View style={styles.section}>
          {MODES.map((mode) => {
            const active = settings?.questionMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => handleMode(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {t(`gameSetup.${modeKey(mode)}`)}
                </Text>
                {active && <MaterialCommunityIcons name="check" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t('settings.privacy')}</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowPrivacy(!showPrivacy)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="shield-lock" size={18} color={Colors.textSecondary} />
            <Text style={styles.optionText}>{t('settings.privacy')}</Text>
            <MaterialCommunityIcons
              name={showPrivacy ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
          {showPrivacy && (
            <View style={styles.privacyBox}>
              <Text style={styles.privacyText}>{t('settings.privacyText')}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>{t('settings.about')}</Text>
        <View style={styles.section}>
          <View style={styles.option}>
            <MaterialCommunityIcons name="information" size={18} color={Colors.textSecondary} />
            <Text style={styles.optionText}>{t('settings.appVersion')}</Text>
            <Text style={styles.optionMeta}>{Constants.expoConfig?.version || '1.0.0'}</Text>
          </View>
          <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleReset} activeOpacity={0.8}>
            <MaterialCommunityIcons name="delete-forever" size={18} color={Colors.danger} />
            <Text style={[styles.optionText, { color: Colors.danger }]}>{t('settings.resetData')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  optionActive: {
    backgroundColor: Colors.primary + '11',
  },
  optionText: {
    ...Typography.body,
    flex: 1,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  privacyBox: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  privacyText: {
    ...Typography.bodySmall,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
