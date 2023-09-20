import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";

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

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
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
