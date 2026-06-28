import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '../translations/tr';
import en from '../translations/en';

const LANGUAGE_KEY = 'shotmat_language';

const getDeviceLanguage = () => {
  const locale = Localization.getLocales?.()?.[0]?.languageCode ?? 'tr';
  return locale === 'tr' ? 'tr' : 'en';
};

export const initI18n = async () => {
  let savedLanguage = null;
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {}

  const language = savedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  });

  return i18n;
};

export const changeLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
};

export default i18n;
