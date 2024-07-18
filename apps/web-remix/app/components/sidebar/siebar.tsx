import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import { ChevronRight } from 'lucide-react';
import { useIsomorphicLayoutEffect, useMediaQuery } from 'usehooks-ts';

//Sidebar copied from Taco

import { IconButton } from '~/components/iconButton';

import type {
  CollapseButtonProps,
  ICollapseButton,
  SidebarBreakpoints,
  SidebarProps,
} from './sidebar.types';

interface ISidebarContext {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const SidebarContext = createContext<ISidebarContext>(undefined!);

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within SidebarContext');
  }

  return context;
};

const defaultBreakpoints: Required<SidebarBreakpoints> = {
  mobile: '(max-width: 767px)',
  narrow: '(min-width: 768px) and (max-width: 1023px)',
  wide: '(min-width: 1024px)',
};

export const Sidebar = (props: SidebarProps) => {
  const {
    bottomContent,
    topContent,
    children,
    className,
    onCollapse,
    collapseButtonClassName,
    tabIndex,
    breakpoints,
    defaultCollapsed = false,
    collapseButton = true,
    collapsed: parentCollapsed,
    testId,
    collapsedToggleButtonProps,
    notCollapsedToggleButtonProps,
    ...rest
  } = props;

  const [collapsed, setCollapsed] = useState(
    parentCollapsed ?? defaultCollapsed,
  );
  const [isCollapsedButtonRendered, setIsCollapsedButtonRendered] =
    useState<ICollapseButton>(false);

  const matchDesktop = useMediaQuery(
    breakpoints?.wide ?? defaultBreakpoints.wide,
  );
  const matchTablet = useMediaQuery(
    breakpoints?.narrow ?? defaultBreakpoints.narrow,
  );

  const collapseStatus = useMemo(
    () => (collapsed ? 'narrow' : 'wide'),
    [collapsed],
  );

  const allowCollapse = useMemo(() => {
    if (parentCollapsed !== undefined) return true;
    return !matchDesktop;
  }, [matchDesktop, parentCollapsed]);

  const toggleCollapse = useCallback(() => {
    if (parentCollapsed === undefined) {
      setCollapsed(!collapsed);
    }
    onCollapse?.(!collapsed);
  }, [collapsed, onCollapse, parentCollapsed]);

  useIsomorphicLayoutEffect(() => {
    if (parentCollapsed !== undefined) return;

    if (matchTablet) {
      setCollapsed(true);
      onCollapse?.(true);
    }
    if (matchDesktop) {
      setCollapsed(false);
      onCollapse?.(false);
    }
  }, [matchTablet, matchDesktop, parentCollapsed]);

  useEffect(() => {
    setIsCollapsedButtonRendered(allowCollapse && (collapseButton as boolean));
  }, [allowCollapse, collapseButton]);

  useEffect(() => {
    if (parentCollapsed !== undefined) {
      setCollapsed(parentCollapsed);
    }
  }, [parentCollapsed]);

  const sidebarStyles = useCallback(() => {
    const baseStyles = 'z-30 h-screen transition-all bg-neutral-850';

    const tabletStyles = classNames(baseStyles, 'w-[80px]');
    const desktopStyles = classNames(baseStyles, 'w-[278px]');

    const variantStyles = {
      wide: desktopStyles,
      narrow: tabletStyles,
    };

    return variantStyles[collapseStatus];
  }, [collapseStatus]);

  const contextValue = useMemo(
    () => ({
      isCollapsed: collapsed,
      toggleCollapse,
    }),
    [collapsed, toggleCollapse],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={classNames(sidebarStyles(), className)}
        tabIndex={tabIndex}
        aria-expanded={!collapsed}
        data-testid={testId}
        {...rest}
      >
        <div className="px-3 relative h-full">
          <aside className="flex h-full w-full flex-col overflow-x-hidden">
            {topContent}
            <div className="py-1 overflow-y-auto overflow-x-hidden grow">
              {children}
              <ToggleButton
                renderButton={isCollapsedButtonRendered}
                className={collapseButtonClassName}
                collapsedAriaLabel={collapsedToggleButtonProps?.['aria-label']}
                notCollapsedAriaLabel={
                  notCollapsedToggleButtonProps?.['aria-label']
                }
              />
            </div>
            {bottomContent}
          </aside>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

function ToggleButton({
  renderButton = true,
  collapsedAriaLabel = 'Expand sidebar',
  notCollapsedAriaLabel = 'Collapse sidebar',
  className,
}: CollapseButtonProps) {
  const { isCollapsed, toggleCollapse } = useSidebar();
  if (!renderButton) return null;
  if (typeof renderButton === 'function') {
    return <>{renderButton(isCollapsed, toggleCollapse)}</>;
  }

  return (
    <div className={classNames(className)}>
      <IconButton
        size="xxs"
        variant="secondary"
        onClick={toggleCollapse}
        aria-label={isCollapsed ? collapsedAriaLabel : notCollapsedAriaLabel}
        icon={
          <ChevronRight
            className={classNames({
              'rotate-180': !isCollapsed,
            })}
          />
        }
      />
    </div>
  );
}
