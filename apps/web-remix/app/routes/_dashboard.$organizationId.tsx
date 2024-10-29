import type { PropsWithChildren } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import {
  Briefcase,
  ChevronDown,
  CircleDollarSign,
  FlaskConical,
  FolderCog,
  Key,
  Layers,
  LogOut,
  Settings,
} from 'lucide-react';
import { ClientOnly } from 'remix-utils/client-only';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import type { ISubscription } from '~/api/subscriptions/subscriptions.types';
import { SubscriptionsApi } from '~/api/subscriptions/SubscriptionsApi';
import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { IconButton } from '~/components/iconButton';
import { UsageCircleProgress } from '~/components/pages/settings/billing/components/BillingProgress';
import {
  NavMobileSidebar,
  NavSidebar,
  NavSidebarContext,
  SidebarLink,
} from '~/components/sidebar/NavSidebar';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { useServerToasts } from '~/hooks/useServerToasts';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';
import { getCurrentUser } from '~/utils/currentUser.server';
import { routes } from '~/utils/routes.utils';
import { getServerToast, setOrganizationId } from '~/utils/toast.server';

export async function loader(loaderArgs: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);

    invariant(params.organizationId, 'organizationId not found');
    const organizationApi = new OrganizationApi(fetch);
    const subscriptionsApi = new SubscriptionsApi(fetch);

    const subscriptionPromise = subscriptionsApi.subscription(
      params.organizationId,
    );
    const organizationsPromise = organizationApi.getOrganizations();

    const [{ data: subscription }, organizationsResponse] = await Promise.all([
      subscriptionPromise,
      organizationsPromise,
    ]);

    const organization = organizationsResponse.data.data.find(
      (org) => org.id === Number(params.organizationId),
    );

    let { cookie, ...toasts } = await getServerToast(request);

    if (!organization) {
      throw new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    cookie = await setOrganizationId(cookie, organization.id);

    const { user } = await getCurrentUser(request);

    return json(
      {
        user,
        toasts,
        organization: organization,
        organizations: organizationsResponse.data.data,
        subscription: subscription.data,
      },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      },
    );
  })(loaderArgs);
}

export default function Layout() {
  const { toasts, subscription } = useLoaderData<typeof loader>();
  const [collapsed, setCollapsed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useServerToasts(toasts);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div id="_root" className="grid h-screen grid-cols-[auto_1fr] ">
      <NavSidebarContext.Provider
        value={{
          collapsed,
          toggleCollapse,
          isOpen,
          openSidebar,
          closeSidebar,
        }}
      >
        <NavSidebar
          topContent={<SidebarTopContent isCollapsed={collapsed} />}
          bottomContent={<SidebarBottomContent isCollapsed={collapsed} />}
        >
          <SidebarMainContent
            isCollapsed={collapsed}
            subscription={subscription}
          />
        </NavSidebar>

        <NavMobileSidebar
          topContent={<SidebarTopContent />}
          bottomContent={<SidebarBottomContent />}
        >
          <SidebarMainContent subscription={subscription} />
        </NavMobileSidebar>

        <main className="col-span-2 lg:col-start-2 w-full">
          <div className="bg-blue-500 z-0 h-[170px] absolute top-0 left-0 right-0 overflow-hidden">
            <img
              src="/bacgkround-blur.png"
              alt="background"
              className="object-cover bg-no-repeat h-full w-full"
            />
          </div>

          <div className="relative pb-5 flex min-h-screen flex-col max-w-full w-full">
            <Outlet />
          </div>
        </main>
      </NavSidebarContext.Provider>
    </div>
  );
}

interface SidebarContentProps {
  isCollapsed?: boolean;
}

function SidebarMainContent({
  isCollapsed,
  subscription,
}: SidebarContentProps & { subscription: ISubscription }) {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <SidebarContentWrapper
      className={cn(
        'gap-2 mt-4 mb-3 transition-all justify-between h-[calc(100%-28px)]',
        {
          '!px-0': !isCollapsed,
        },
      )}
    >
      <div className="flex flex-col gap-2">
        <SidebarLink
          to={routes.pipelines(organization.id)}
          icon={<Layers className="min-w-4 w-4 h-4 text-center leading-5" />}
          text="Workflows"
          onlyIcon={isCollapsed}
        />

        <SidebarLink
          to={routes.knowledgeBase(organization.id)}
          icon={<Briefcase className="min-w-4 w-4 h-4 text-center leading-5" />}
          text="Knowledge Base"
          onlyIcon={isCollapsed}
        />

        <SidebarLink
          to={routes.secrets(organization.id)}
          icon={<Key className="min-w-4 w-4 h-4 text-center leading-5" />}
          onlyIcon={isCollapsed}
          text="Secrets"
        />

        <SidebarLink
          to={routes.experiments(organization.id)}
          icon={
            <FlaskConical className="min-w-4 w-4 h-4 text-center leading-5" />
          }
          onlyIcon={isCollapsed}
          text="Experiments"
        />

        <SidebarLink
          to={routes.datasets(organization.id)}
          icon={<FolderCog className="min-w-4 w-4 h-4 text-center leading-5" />}
          onlyIcon={isCollapsed}
          text="Datasets"
        />

        <SidebarLink
          to={routes.organizationCosts(organization.id)}
          icon={
            <CircleDollarSign className="min-w-4 w-4 h-4 text-center leading-5" />
          }
          onlyIcon={isCollapsed}
          text="Costs"
        />
      </div>

      <div className="flex flex-col gap-3">
        <SidebarUsageProgress
          isCollapsed={isCollapsed}
          subscription={subscription}
        />

        <SidebarLink
          to={routes.settings(organization.id)}
          icon={<Settings className="min-w-4 w-4 h-4 text-center leading-5" />}
          text="Settings"
          onlyIcon={isCollapsed}
        />
      </div>
    </SidebarContentWrapper>
  );
}

function SidebarUsageProgress({
  isCollapsed,
  subscription,
}: {
  isCollapsed?: boolean;
  subscription: ISubscription;
}) {
  return (
    <div className="grid grid-cols-1 grid-rows-1 items-end">
      <div
        className={cn('transition-opacity col-start-1 row-start-1', {
          'opacity-100': isCollapsed,
          'opacity-0 pointer-events-none': !isCollapsed,
        })}
      >
        <UsageCircleProgress
          usage={321}
          maxUsage={subscription.features.runs_limit}
        />
      </div>

      <div
        className={cn(
          'transition-opacity bg-muted rounded-lg col-start-1 row-start-1 p-2 flex gap-2 justify-between items-end',
          {
            'opacity-100': !isCollapsed,
            'opacity-0 pointer-events-none': isCollapsed,
          },
        )}
      >
        <div className="text-xs grow flex flex-col gap-1">
          <p className="flex gap-1 justify-between items-center">
            <span>Total</span>
            <span>{subscription.features.runs_limit}</span>
          </p>
          <p className="flex gap-1 justify-between items-center">
            <span>Remaining</span>
            <span>
              {subscription.features.runs_limit - subscription.usage.runs_limit}
            </span>
          </p>
        </div>

        <UsageCircleProgress
          usage={subscription.usage.runs_limit}
          maxUsage={subscription.features.runs_limit}
        />
      </div>
    </div>
  );
}

function SidebarTopContent({ isCollapsed }: SidebarContentProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { organization, organizations } = useLoaderData<typeof loader>();
  const { name } = organization;
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setShowMenu(false);
  }, []);

  const handleOpen = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleChangeRoute = useCallback((id: number) => {
    navigate(routes.pipelines(id));
    handleClose();
  }, []);

  return (
    <SidebarContentWrapper className="border-b border-neutral-100 py-4 mt-1 pl-2 pr-1">
      <div ref={menuRef}>
        <Dropdown shown={showMenu} onClose={handleClose} placement="bottom-end">
          <DropdownTrigger
            onClick={handleOpen}
            className="w-full p-0 overflow-hidden flex justify-between items-center bg-transparent hover:bg-transparent rounded-lg"
            variant="secondary"
          >
            {isCollapsed && (
              <Avatar>
                <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
              </Avatar>
            )}
            {!isCollapsed && (
              <>
                <span className="block max-w-[80%] text-sm font-medium whitespace-nowrap truncate">
                  {organization.name}
                </span>

                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </DropdownTrigger>

          <ClientOnly fallback={null}>
            {() =>
              createPortal(
                <DropdownPopup className="min-w-[250px] z-[70] bg-white border border-input rounded-lg overflow-hidden p-2 lg:min-w-[350px]">
                  <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-1">
                    {organizations.map((org) => {
                      return (
                        <Button
                          size="xs"
                          variant={
                            organization.id === org.id ? 'secondary' : 'ghost'
                          }
                          className="text-left justify-start  text-foreground"
                          key={`${org.id}`}
                          onClick={() => handleChangeRoute(org.id)}
                        >
                          {org.name}
                        </Button>
                      );
                    })}
                  </div>
                  <DropdownMenuSeparator />
                  <NewOrganizationLink />
                </DropdownPopup>,
                document.body,
              )
            }
          </ClientOnly>
        </Dropdown>
      </div>
    </SidebarContentWrapper>
  );
}

function NewOrganizationLink() {
  return (
    <div className="w-full py-2">
      <Button size="xs" asChild>
        <Link to={routes.newOrganization()}>Create new</Link>
      </Button>
    </div>
  );
}

function SidebarBottomContent({ isCollapsed }: SidebarContentProps) {
  return (
    <SidebarContentWrapper className="border-t border-neutral-100 py-3 !flex-row justify-between">
      {!isCollapsed && (
        <div className="flex flex-col text-xs text-white">
          {/*<p>Majkel Ward</p>*/}
          {/*<p>elp@elp.com</p>*/}
        </div>
      )}
      <LogoutButton />
    </SidebarContentWrapper>
  );
}

function LogoutButton() {
  const logout = useFetcher();

  return (
    <IconButton
      size="sm"
      variant="ghost"
      aria-label="Logout"
      icon={<LogOut />}
      className="!text-muted-foreground hover:!text-foreground"
      onClick={() => {
        logout.submit({}, { method: 'DELETE', action: '/logout' });
      }}
    />
  );
}

interface SidebarContentWrapperProps extends PropsWithChildren {
  className?: string;
}
export function SidebarContentWrapper({
  children,
  className,
}: SidebarContentWrapperProps) {
  return (
    <div className={cn('flex flex-col px-[10px]', className)}>{children}</div>
  );
}
