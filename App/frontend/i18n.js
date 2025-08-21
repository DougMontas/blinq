// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const deviceLang = Localization?.locale?.split?.('-')?.[0] || 'en';

const resources = {
  en: { translation: { welcome: "Welcome to BlinqFix", getStarted: "Get Started" } },
  es: { translation: { welcome: "Bienvenido a BlinqFix", getStarted: "Comenzar" } },
  zh: { translation: { welcome: "欢迎使用 BlinqFix", getStarted: "开始使用" } },
  hi: { translation: { welcome: "BlinqFix में आपका स्वागत है", getStarted: "शुरू करें" } },
  ar: { translation: { welcome: "مرحبًا بك في BlinqFix", getStarted: "ابدأ" } },
  pt: { translation: { welcome: "Bem-vindo ao BlinqFix", getStarted: "Começar" } },
  fr: { translation: { welcome: "Bienvenue sur BlinqFix", getStarted: "Commencer" } },
  ko: { translation: { welcome: "BlinqFix에 오신 것을 환영합니다", getStarted: "시작하기" } },
  ru: { translation: { welcome: "Добро пожаловать в BlinqFix", getStarted: "Начать" } },
  vi: { translation: { welcome: "Chào mừng đến với BlinqFix", getStarted: "Bắt đầu" } },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: deviceLang, // fallback-safe language
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
