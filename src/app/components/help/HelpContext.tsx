"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HelpContextType {
  helpEnabled: boolean;
  setHelpEnabled: (enabled: boolean) => void;
  toggleHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

const STORAGE_KEY = 'supplier-risk-help-enabled';

export function HelpProvider({ children }: { children: ReactNode }) {
  const [helpEnabled, setHelpEnabledState] = useState(true); // Default ON per nuovi utenti
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setHelpEnabledState(stored === 'true');
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when changed
  const setHelpEnabled = (enabled: boolean) => {
    setHelpEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  };

  const toggleHelp = () => {
    setHelpEnabled(!helpEnabled);
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <HelpContext.Provider value={{ helpEnabled, setHelpEnabled, toggleHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

// Hook per verificare se il context esiste (per componenti che possono essere usati fuori dal provider)
export function useHelpOptional() {
  const context = useContext(HelpContext);
  return context ?? { helpEnabled: false, setHelpEnabled: () => {}, toggleHelp: () => {} };
}
