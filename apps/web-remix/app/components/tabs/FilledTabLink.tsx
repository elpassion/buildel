import React from "react";
import { TabButtonProps } from "~/components/tabs/Tab";
import classNames from "classnames";
import { useTabsContext } from "~/components/tabs/TabGroup";
import { Link } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/dist/components";

export const FilledTabLink: React.FC<TabButtonProps & RemixLinkProps> = ({
  children,
  className,
  tabId,
  ...rest
}) => {
  const { activeTabId } = useTabsContext();
  return (
    <Link
      className={classNames(
        "text-xs rounded-lg text-neutral-100 py-1 px-3 hover:bg-neutral-900",
        { "bg-neutral-900": activeTabId === tabId },
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
};
