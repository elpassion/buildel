import { PropsWithChildren, useCallback, useRef, useState } from "react";
import invariant from "tiny-invariant";
import classNames from "classnames";
import Modal from "react-modal";
import { useOnClickOutside } from "usehooks-ts";
import { MenuInfo } from "rc-menu/es/interface";
import { Avatar, Button, Icon, IconButton } from "@elpassion/taco";
import { DataFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { OrganizationsResponse } from "~/components/pages/organizations/contracts";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { Menu } from "~/components/menu/Menu";
import { MenuItem } from "~/components/menu/MenuItem";
import { PageOverlay } from "~/components/overlay/PageOverlay";
import {
  NavMobileSidebar,
  NavSidebar,
  NavSidebarContext,
  SidebarLink,
} from "~/components/sidebar/NavSidebar";

Modal.setAppElement("#_root");
export async function loader(loaderArgs: DataFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    const { cookie, error } = await getToastError(request);

    const organizationsResponse = await fetch(
      OrganizationsResponse,
      `/organizations`
    );

    const organization = organizationsResponse.data.data.find(
      (org) => org.id === Number(params.organizationId)
    );

    if (!organization) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }

    return json(
      {
        error,
        organization: organization,
        organizations: organizationsResponse.data.data,
      },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  })(loaderArgs);
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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
    <div id="_root" className="grid h-screen grid-cols-[auto_1fr]">
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
          <SidebarMainContent isCollapsed={collapsed} />
        </NavSidebar>

        <NavMobileSidebar
          topContent={<SidebarTopContent />}
          bottomContent={<SidebarBottomContent />}
        >
          <SidebarMainContent />
        </NavMobileSidebar>

        <main className="col-span-2 flex min-h-screen flex-col overflow-x-auto pb-5 lg:col-auto">
          <Outlet />
        </main>
      </NavSidebarContext.Provider>
    </div>
  );
}

interface SidebarContentProps {
  isCollapsed?: boolean;
}

function SidebarMainContent({ isCollapsed }: SidebarContentProps) {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <SidebarContentWrapper
      className={classNames(
        "gap-2 mt-2 transition-all justify-between h-[calc(100%-8px)]",
        {
          "!px-0": !isCollapsed,
        }
      )}
    >
      <div className="flex flex-col gap-1">
        <SidebarLink
          to={routes.pipelines(organization.id)}
          icon={
            <Icon iconName="home" className="w-5 h-5 text-center leading-5" />
          }
          text="Home"
          onlyIcon={isCollapsed}
        />

        <SidebarLink
          to={routes.knowledgeBase(organization.id)}
          icon={
            <Icon
              iconName="briefcase"
              className="w-5 h-5 text-center leading-5"
            />
          }
          text="Knowledge Base"
          onlyIcon={isCollapsed}
        />

        <SidebarLink
          to={routes.apiKeys(organization.id)}
          icon={
            <Icon iconName="key" className="w-5 h-5 text-center leading-5" />
          }
          text="API Keys"
          onlyIcon={isCollapsed}
        />
      </div>
      <div>
        <SidebarLink
          to={routes.dashboard}
          icon={
            <Icon
              iconName="life-buoy"
              className="w-5 h-5 text-center leading-5"
            />
          }
          text="Support"
          onlyIcon={isCollapsed}
        />

        <SidebarLink
          to={routes.dashboard}
          icon={
            <Icon
              iconName="settings"
              className="w-5 h-5 text-center leading-5"
            />
          }
          text="Settings"
          onlyIcon={isCollapsed}
        />
      </div>
    </SidebarContentWrapper>
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

  useOnClickOutside(menuRef, handleClose);

  const handleChangeRoute = useCallback((menu: MenuInfo) => {
    navigate(routes.pipelines(menu.key));
    handleClose();
  }, []);

  return (
    <SidebarContentWrapper className="border-b border-neutral-400 py-4 mt-1 pl-2 pr-1">
      <PageOverlay
        isShow={showMenu}
        className={classNames({ "!z-[20]": showMenu })}
      />

      <div ref={menuRef}>
        <button
          onClick={handleOpen}
          className="w-full h-10 overflow-hidden flex justify-between items-center text-neutral-100 rounded-lg"
        >
          {isCollapsed && (
            <Avatar name={name} contentType="text" shape="square" size="md" />
          )}
          {!isCollapsed && (
            <>
              <span className="block max-w-[80%] text-sm font-medium whitespace-nowrap truncate">
                {organization.name}
              </span>
              <Icon
                iconName={showMenu ? "chevron-up" : "chevron-down"}
                className="text-xl"
              />
            </>
          )}
        </button>

        <Menu
          hidden={!showMenu}
          activeKey={`${organization.id}`}
          className="min-w-[248px] absolute z-[51] top-[60px] left-[85%] max-h-[400px] overflow-y-auto"
          onClick={handleChangeRoute}
        >
          <NewOrganizationLink />

          {organizations.map((org) => {
            return <MenuItem key={`${org.id}`}>{org.name}</MenuItem>;
          })}
        </Menu>
      </div>
    </SidebarContentWrapper>
  );
}

function NewOrganizationLink() {
  return (
    <div className="w-full pl-6 py-2">
      <Link to={routes.newOrganization()}>
        <Button tabIndex={0} size="xs">
          Create new
        </Button>
      </Link>
    </div>
  );
}

function SidebarBottomContent({ isCollapsed }: SidebarContentProps) {
  return (
    <SidebarContentWrapper className="border-t border-neutral-400 py-3 !flex-row justify-between">
      {!isCollapsed && (
        <div className="flex flex-col text-xs text-white">
          <p>Majkel Ward</p>
          <p>elp@elp.com</p>
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
      icon={<Icon iconName="log-out" />}
      variant="basic"
      className="!text-neutral-100 hover:!bg-neutral-700"
      onClick={() => {
        logout.submit({}, { method: "DELETE", action: "/logout" });
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
    <div className={classNames("flex flex-col px-[10px]", className)}>
      {children}
    </div>
  );
}
