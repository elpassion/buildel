import type { PropsWithChildren } from 'react';
import React, { useCallback } from 'react';

import { useTabsContext } from '~/components/tabs/TabGroup';

interface TabProps extends PropsWithChildren {
  tabId: string;
}
export const Tab: React.FC<TabProps> = ({ children, tabId }) => {
  const { activeTabId } = useTabsContext();

  if (activeTabId !== tabId) return;
  return <div>{children}</div>;
};

export interface TabButtonProps extends PropsWithChildren {
  tabId: string;
  className?: string;
  component?: 'link' | 'button';
}
export const TabButton = React.forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ children, className, tabId, ...rest }, ref) => {
    const { setActiveTab } = useTabsContext();

    const handleSetActiveTab = useCallback(() => {
      setActiveTab(tabId);
    }, [setActiveTab, tabId]);

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        onClick={handleSetActiveTab}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
