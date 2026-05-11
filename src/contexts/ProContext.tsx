import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProContextValue {
  isPro: boolean;
  showPaywall: () => void;
}

const ProContext = createContext<ProContextValue>({
  isPro: false,
  showPaywall: () => {},
});

export function usePro() {
  return useContext(ProContext);
}

interface Props {
  children: React.ReactNode;
  paywallComponent: (visible: boolean, onClose: () => void) => React.ReactNode;
}

export function ProProvider({ children, paywallComponent }: Props) {
  const [isPro] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  return (
    <ProContext.Provider value={{ isPro, showPaywall }}>
      {children}
      {paywallComponent(paywallVisible, hidePaywall)}
    </ProContext.Provider>
  );
}
