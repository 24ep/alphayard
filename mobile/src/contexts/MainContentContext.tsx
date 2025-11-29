import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MainSection = 'home' | 'gallery' | 'calendar' | 'notes' | 'chat';

interface MainContentContextValue {
  activeSection: MainSection;
  setActiveSection: (s: MainSection) => void;
}

const MainContentContext = createContext<MainContentContextValue | undefined>(undefined);

export const MainContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<MainSection>('home');
  return (
    <MainContentContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </MainContentContext.Provider>
  );
};

export const useMainContent = (): MainContentContextValue => {
  const ctx = useContext(MainContentContext);
  if (!ctx) throw new Error('useMainContent must be used within MainContentProvider');
  return ctx;
};


