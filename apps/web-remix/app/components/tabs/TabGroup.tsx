import React, { PropsWithChildren, useCallback, useState } from "react";

interface ITabsContext {
  activeTabId?: string;
  setActiveTab: (id: string) => void;
}
const TabsContext = React.createContext<ITabsContext | null>(null);

interface TabGroupProps extends PropsWithChildren {
  defaultActiveTab?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  defaultActiveTab,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveTab);

  const handleSetTabId = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  return (
    <TabsContext.Provider value={{ activeTabId, setActiveTab: handleSetTabId }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = () => {
  const ctx = React.useContext(TabsContext);

  if (!ctx) {
    throw new Error(
      "useTabsContext have to be used inside TabsContextProvider"
    );
  }

  return ctx;
};
