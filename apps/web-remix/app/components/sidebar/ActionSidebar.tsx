import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import startCase from "lodash.startcase";
import { Icon, IconButton } from "@elpassion/taco";
import { PageOverlay } from "~/components/overlay/PageOverlay";

interface ActionSidebarProps extends PropsWithChildren {
  className?: string;
  isOpen: boolean;
  onClose?: () => void;
  overlay?: boolean;
  overlayClassName?: string;
}

export const ActionSidebar: React.FC<ActionSidebarProps> = ({
  className,
  children,
  isOpen,
  onClose,
  overlay = false,
  overlayClassName,
}) => {
  return (
    <>
      {overlay ? (
        <PageOverlay
          isShow={isOpen}
          onClick={onClose}
          className={classNames(overlayClassName)}
        />
      ) : null}
      <aside
        className={classNames(
          "fixed z-50 inset-0 bg-neutral-850 px-4 py-8 w-full transition-opacity duration-300 ease-[cubic-bezier(0.25, 1, 0.5, 1)] flex flex-col sm:w-[360px] sm:transition sm:left-auto sm:right-4 sm:inset-y-4 sm:rounded-xl",
          {
            "translate-x-0 opacity-100 pointer-events-auto": isOpen,
            "translate-x-[150%] opacity-0 pointer-events-none": !isOpen,
          },
          className
        )}
      >
        {children}
      </aside>
    </>
  );
};

interface ActionSidebarHeaderProps {
  heading: string;
  subheading?: string;
  onClose: () => void;
  className?: string;
}
export function ActionSidebarHeader({
  subheading,
  heading,
  onClose,
  className,
}: ActionSidebarHeaderProps) {
  return (
    <header
      className={classNames(
        "flex justify-between gap-1 mb-6 pb-6 border-b border-neutral-100",
        className
      )}
    >
      <div className="grow-1">
        <h3 className="mb-2 text-xl font-medium  text-white">
          {startCase(heading)}
        </h3>
        {subheading ? (
          <p className="text-neutral-100 text-xs">{subheading}</p>
        ) : null}
      </div>
      <IconButton
        size="sm"
        variant="outlined"
        onClick={onClose}
        aria-label="Close sidebar"
        icon={<Icon iconName="x" />}
      />
    </header>
  );
}
