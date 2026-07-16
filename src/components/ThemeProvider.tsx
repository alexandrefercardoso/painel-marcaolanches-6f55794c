import React, { createContext, useContext, useEffect, useMemo } from "react";

interface VisualSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  card_color: string;
  sidebar_color: string;
  header_color: string;
  icon_color: string;
  success_color: string;
  error_color: string;
  warning_color: string;
  menu_background_color: string;
  menu_card_color: string;
  menu_price_color: string;
  menu_category_active_color: string;
  menu_add_button_color: string;
  menu_cart_icon_color: string;
  theme_name: string;
  dark_mode: string;
  border_radius: string;
}

const DEFAULT_SETTINGS: VisualSettings = {
  primary_color: '#ef4444',
  secondary_color: '#1f2937',
  accent_color: '#f59e0b',
  background_color: '#f9fafb',
  text_color: '#111827',
  button_color: '#ef4444',
  button_text_color: '#ffffff',
  card_color: '#ffffff',
  sidebar_color: '#ffffff',
  header_color: '#ffffff',
  icon_color: '#6b7280',
  success_color: '#22c55e',
  error_color: '#ef4444',
  warning_color: '#f59e0b',
  menu_background_color: '#f9fafb',
  menu_card_color: '#ffffff',
  menu_price_color: '#ef4444',
  menu_category_active_color: '#ef4444',
  menu_add_button_color: '#ef4444',
  menu_cart_icon_color: '#ffffff',
  theme_name: 'default',
  dark_mode: 'auto',
  border_radius: '1rem'
};

interface ThemeContextType {
  settings: VisualSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<VisualSettings>) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [localTheme, setLocalTheme] = React.useState<'light' | 'dark' | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved === 'light' || saved === 'dark') ? saved : null;
    }
    return null;
  });

  const effectiveTheme = useMemo(() => {
    if (localTheme) return localTheme;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, [localTheme]);

  const handleSetTheme = (theme: 'light' | 'dark') => {
    setLocalTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const cssVariables = useMemo(() => {
    const settings = DEFAULT_SETTINGS;
    if (effectiveTheme === 'dark') return "";

    return `
      :root:not(.dark) {
        --primary: ${settings.primary_color};
        --primary-foreground: ${settings.button_text_color};
        --secondary: ${settings.secondary_color};
        --accent: ${settings.accent_color};
        --background: ${settings.background_color};
        --foreground: ${settings.text_color};
        --card: ${settings.card_color};
        --card-foreground: ${settings.text_color};
        --popover: ${settings.card_color};
        --popover-foreground: ${settings.text_color};
        --border: #e5e7eb;
        --input: #e5e7eb;
        --ring: ${settings.primary_color};
        --radius: ${settings.border_radius};
        
        /* Custom UI Variables */
        --sidebar: ${settings.sidebar_color};
        --header: ${settings.header_color};
        --icon: ${settings.icon_color};
        --button: ${settings.button_color};
        --button-foreground: ${settings.button_text_color};
        
        /* Status */
        --success: ${settings.success_color};
        --error: ${settings.error_color};
        --warning: ${settings.warning_color};
        
        /* Menu Specific */
        --menu-bg: ${settings.menu_background_color};
        --menu-card: ${settings.menu_card_color};
        --menu-price: ${settings.menu_price_color};
        --menu-category-active: ${settings.menu_category_active_color};
        --menu-add-button: ${settings.menu_add_button_color};
        --menu-cart-icon: ${settings.menu_cart_icon_color};
      }
    `;
  }, [effectiveTheme]);

  useEffect(() => {
    if (!cssVariables) {
      const styleTag = document.getElementById("dynamic-theme");
      if (styleTag) styleTag.innerHTML = "";
      return;
    }

    let styleTag = document.getElementById("dynamic-theme");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssVariables;
  }, [cssVariables]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  return (
    <ThemeContext.Provider value={{ 
      settings: DEFAULT_SETTINGS, 
      isLoading: false, 
      updateSettings: () => {},
      theme: effectiveTheme,
      setTheme: handleSetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
