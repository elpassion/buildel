import type { PropsWithChildren } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

interface ITabsContext {
  activeTabId?: string;
  setActiveTab: (id: string) => void;
}
const TabsContext = React.createContext<ITabsContext | null>(null);

interface TabGroupProps extends PropsWithChildren {
  defaultActiveTab?: string;
  activeTab?: string;
  setActiveTab?: (id: string) => void;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  defaultActiveTab,
  activeTab,
  setActiveTab,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveTab);

  const handleSetTabId = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const value = useMemo(() => {
    return {
      activeTabId: activeTab ?? activeTabId,
      setActiveTab: setActiveTab ?? handleSetTabId,
    };
  }, [activeTab, activeTabId, handleSetTabId, setActiveTab]);

  return <TabsContext value={value}>{children}</TabsContext>;
};

export const useTabsContext = () => {
  const ctx = React.use(TabsContext);

  if (!ctx) {
    throw new Error(
      'useTabsContext have to be used inside TabsContextProvider',
    );
  }

  return ctx;
};
