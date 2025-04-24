import React from 'react';
import { useLanguage } from './LanguageContext';

function TimeoutPage() {
  const { getText } = useLanguage();

  return (
    <div className="timeout-page">
      <div className="timeout-content">
        <h2>{getText('timeoutTitle')}</h2>
        <p>{getText('timeoutMessage')}</p>
      </div>
    </div>
  );
}

export default TimeoutPage; 