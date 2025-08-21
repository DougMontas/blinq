import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translations
import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import tl from './locales/tl.json';
import vi from './locales/vi.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import ht from './locales/ht.json';
import de from './locales/de.json';

const LANG_KEY = 'app-language';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      tl: { translation: tl },
      vi: { translation: vi },
      ar: { translation: ar },
      fr: { translation: fr },
      ko: { translation: ko },
      ru: { translation: ru },
      ht: { translation: ht },
      de: { translation: de },
    },
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const loadLanguage = async () => {
  const saved = await AsyncStorage.getItem(LANG_KEY);
  if (saved) {
    i18n.changeLanguage(saved);
  }
};

export const saveLanguage = async (lang) => {
  await AsyncStorage.setItem(LANG_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;
