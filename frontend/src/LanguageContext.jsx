import React, { createContext, useState, useContext, useEffect } from 'react';
import translationData from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [displayLanguage, setDisplayLanguage] = useState('english');

  useEffect(() => {
    // Extract LANG from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('LANG');
    if (lang) {
      // Convert to lowercase and remove any curly braces
      const cleanLang = lang.toLowerCase().replace(/[{}]/g, '');
      // Only set if it's a supported language
      if (translationData[cleanLang]) {
        setDisplayLanguage(cleanLang);
      }
    }
  }, []);

  // Get translations for the current language
  const getText = (key) => {
    const currentTranslations = translationData[displayLanguage] || translationData.english;
    return key.split('.').reduce((obj, k) => (obj || {})[k], currentTranslations) || key;
  };

  const formatText = (key, ...args) => {
    const text = getText(key);
    return args.reduce((str, arg, i) => str.replace(`{${i}}`, arg), text);
  };

  const value = {
    displayLanguage,
    setDisplayLanguage,
    getText,
    formatText,
    language: displayLanguage,
    translations: translationData
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 