/**
 * Language Context
 *
 * Provides language switching functionality via React Context.
 * Automatically persists language choice to localStorage.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { saveLanguage, SUPPORTED_LANGUAGES, type LanguageCode } from './index'

interface LanguageContextValue {
  /** Current language code */
  language: LanguageCode
  /** Change the current language */
  setLanguage: (language: LanguageCode) => void
  /** List of supported languages */
  supportedLanguages: typeof SUPPORTED_LANGUAGES
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

interface LanguageProviderProps {
  children: React.ReactNode
}

/**
 * LanguageProvider - Provides language context to the app
 *
 * Wrap your app with this provider to enable language switching.
 * Language preference is automatically persisted to localStorage.
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Initialize with current i18n language
    return (i18n.language || 'zh-CN') as LanguageCode
  })

  // Sync with i18n on mount
  useEffect(() => {
    const currentLang = i18n.language as LanguageCode
    if (currentLang && SUPPORTED_LANGUAGES.some(l => l.code === currentLang)) {
      setLanguageState(currentLang)
    }
  }, [i18n.language])

  // Change language handler
  const setLanguage = useCallback((newLanguage: LanguageCode) => {
    i18n.changeLanguage(newLanguage).then(() => {
      setLanguageState(newLanguage)
      saveLanguage(newLanguage)
    })
  }, [i18n])

  const value: LanguageContextValue = {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * useLanguage - Hook to access language context
 *
 * Returns the current language and a function to change it.
 * Must be used within a LanguageProvider.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
