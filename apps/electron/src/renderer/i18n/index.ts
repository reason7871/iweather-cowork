/**
 * i18n Configuration
 *
 * Initializes i18next with react-i18next for internationalization.
 * Default language is zh-CN (Chinese Simplified), fallback is en-US.
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import Chinese translations
import zhCommon from './locales/zh-CN/common.json'
import zhMenu from './locales/zh-CN/menu.json'
import zhSettings from './locales/zh-CN/settings.json'

// Import English translations
import enCommon from './locales/en-US/common.json'
import enMenu from './locales/en-US/menu.json'
import enSettings from './locales/en-US/settings.json'

// Language resources
const resources = {
  'zh-CN': {
    common: zhCommon,
    menu: zhMenu,
    settings: zhSettings,
  },
  'en-US': {
    common: enCommon,
    menu: enMenu,
    settings: enSettings,
  },
}

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'craft-agent-language'

/**
 * Get saved language from localStorage or return default
 */
function getSavedLanguage(): string {
  try {
    if (typeof window === 'undefined') return 'zh-CN'
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
      return saved
    }
  } catch {
    // localStorage might not be available
  }
  return 'zh-CN'
}

/**
 * Save language preference to localStorage
 */
export function saveLanguage(language: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    }
  } catch {
    // localStorage might not be available
  }
}

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',  // Default to Chinese
    fallbackLng: 'en-US',
    defaultNS: 'common',
    ns: ['common', 'menu', 'settings'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

// After initialization, try to load saved language preference
if (typeof window !== 'undefined') {
  const saved = getSavedLanguage()
  if (saved && saved !== 'zh-CN') {
    i18n.changeLanguage(saved)
  }
}

export default i18n

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']
