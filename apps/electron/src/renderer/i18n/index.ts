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
import zhSessions from './locales/zh-CN/sessions.json'
import zhErrors from './locales/zh-CN/errors.json'
import zhOnboarding from './locales/zh-CN/onboarding.json'

// Import English translations
import enCommon from './locales/en-US/common.json'
import enMenu from './locales/en-US/menu.json'
import enSettings from './locales/en-US/settings.json'
import enSessions from './locales/en-US/sessions.json'
import enErrors from './locales/en-US/errors.json'
import enOnboarding from './locales/en-US/onboarding.json'

// Language resources
const resources = {
  'zh-CN': {
    common: zhCommon,
    menu: zhMenu,
    settings: zhSettings,
    sessions: zhSessions,
    errors: zhErrors,
    onboarding: zhOnboarding,
  },
  'en-US': {
    common: enCommon,
    menu: enMenu,
    settings: enSettings,
    sessions: enSessions,
    errors: enErrors,
    onboarding: enOnboarding,
  },
}

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'craft-agent-language'

/**
 * Get saved language from localStorage or return default
 */
function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'zh-CN'
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
    return saved
  }
  return 'zh-CN' // Default to Chinese
}

/**
 * Save language preference to localStorage
 */
export function saveLanguage(language: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }
}

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en-US',
    defaultNS: 'common',
    ns: ['common', 'menu', 'settings', 'sessions', 'errors', 'onboarding'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for simpler loading
    },
  })

export default i18n

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']
