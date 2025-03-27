import React, { createContext, useState, useContext, useEffect } from 'react';
import translationData from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [displayLanguage, setDisplayLanguage] = useState('english');
  const [prolificPid, setProlificPid] = useState(null);
  const [studyId, setStudyId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Extract parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle LANG parameter
    const lang = urlParams.get('LANG');
    if (lang) {
      // Convert to lowercase and remove any curly braces or whitespace
      const cleanLang = lang.toLowerCase().replace(/[{}]/g, '').trim();
      // Only set if it's a supported language
      if (translationData[cleanLang]) {
        setDisplayLanguage(cleanLang);
      } else {
        console.warn(`Unsupported language: ${lang}. Defaulting to English.`);
      }
    }

    // Handle PROLIFIC_PID parameter
    const pid = urlParams.get('PROLIFIC_PID');
    if (pid) {
      setProlificPid(pid);
    }

    // Handle STUDY_ID parameter
    const study = urlParams.get('STUDY_ID');
    if (study) {
      setStudyId(study);
    }

    // Handle SESSION_ID parameter
    const session = urlParams.get('SESSION_ID');
    if (session) {
      setSessionId(session);
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
    translations: translationData,
    prolificPid,
    studyId,
    sessionId
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