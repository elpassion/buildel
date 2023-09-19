import React, { PropsWithChildren, useCallback } from "react";
import { useTabsContext } from "~/components/tabs/TabGroup";

interface TabProps extends PropsWithChildren {
  tabId: string;
}
export const Tab: React.FC<TabProps> = ({ children, tabId }) => {
  const { activeTabId } = useTabsContext();

  if (activeTabId !== tabId) return;
  return <div>{children}</div>;
};

interface TabButtonProps extends PropsWithChildren {
  tabId: string;
}
export const TabButton: React.FC<TabButtonProps> = ({ children, tabId }) => {
  const { setActiveTab } = useTabsContext();

  const handleSetActiveTab = useCallback(() => {
    setActiveTab(tabId);
  }, [setActiveTab, tabId]);

  return <button onClick={handleSetActiveTab}>{children}</button>;
};
