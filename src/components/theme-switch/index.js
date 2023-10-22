import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { getValueFromLocalStorage, setValueToLocalStorage } from '../../utils/localStorage';
import './style.scss';

function ThemeSwitch() {
  const isClient = typeof window !== 'undefined';
  const initialSystemDarkMode = isClient ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  const [isDarkMode, setIsDarkMode] = useState(getValueFromLocalStorage('isDarkMode') ?? initialSystemDarkMode);

  useEffect(() => {
    if (!isClient) return;
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const changeHandler = () => setIsDarkMode(darkModeMediaQuery.matches);

    darkModeMediaQuery.addListener(changeHandler);


    setValueToLocalStorage('isDarkMode', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        return () => {
      darkModeMediaQuery.removeListener(changeHandler);
    };
  }, [isDarkMode, isClient]);  // isClient 추가

  if (!isClient) return null;

  return (
    <div className="dark-mode-button-wrapper">
      <IconButton className="dark-mode-button" onClick={() => setIsDarkMode((isDark) => !isDark)}>
        {isDarkMode ? (
          <LightModeIcon className="dark-mode-icon" fontSize="large" />
        ) : (
          <DarkModeIcon className="dark-mode-icon" fontSize="large" />
        )}
      </IconButton>
    </div>
  );
}

export default ThemeSwitch;
