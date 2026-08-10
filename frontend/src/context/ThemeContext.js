import { createContext, useContext } from 'react';
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
});
export const useTheme = () => useContext(ThemeContext);
