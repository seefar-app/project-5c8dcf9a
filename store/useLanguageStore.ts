import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Language } from '../i18n/translations';

interface LanguageState {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
}

// Detect device language and map to supported languages
const getDeviceLanguage = (): Language => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
  
  if (deviceLocale.startsWith('ar')) return 'ar';
  if (deviceLocale.startsWith('fr')) return 'fr';
  return 'en';
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getDeviceLanguage(),
      isRTL: getDeviceLanguage() === 'ar',
      setLanguage: (language) => set({ 
        language, 
        isRTL: language === 'ar' 
      }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
