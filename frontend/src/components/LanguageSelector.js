import React from 'react';

const LanguageSelector = ({ value, onChange, disabled = false }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' }
  ];

  return (
    <div className="language-selector">
      <label htmlFor="language-select">Select Language:</label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="language-dropdown"
      >
        <option value="" disabled>Choose a language...</option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="language-tips">
        <small>💡 Select the language spoken in the audio for better accuracy</small>
      </div>
    </div>
  );
};

export default LanguageSelector;