import { useCallback, useRef, useState } from "react";
import invariant from "tiny-invariant";
import classNames from "classnames";
import Modal from "react-modal";
import { useOnClickOutside } from "usehooks-ts";
import { MenuInfo } from "rc-menu/es/interface";
import { Avatar, Icon, IconButton, Sidebar } from "@elpassion/taco";
import { LoaderArgs, json } from "@remix-run/node";
import {
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
import { SidebarContentWrapper } from "~/components/sidebar/SidebarContentWrapper";
import { PageOverlay } from "~/components/overlay/PageOverlay";
import { SidebarLink } from "~/components/sidebar/SidebarLink";

Modal.setAppElement("#_root");
export async function loader(loaderArgs: LoaderArgs) {
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
  const { organization } = useLoaderData<typeof loader>();
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div
      id="_root"
      className="grid h-screen grid-cols-[auto_1fr] bg-neutral-950"
    >
      <div className="hidden md:block md:p-4">
        <Sidebar
          className="sticky top-0 !h-[calc(100vh-32px)] rounded-[1.25rem]"
          collapseBtnClassName="absolute top-[60px] -right-2"
          topContent={<SidebarTopContent isCollapsed={collapsed} />}
          bottomContent={<SidebarBottomContent />}
          onCollapse={toggleCollapse}
          collapsed={collapsed}
          collapseButton={false}
        >
          <SidebarContentWrapper className="gap-2 mt-2">
            <SidebarLink to={routes.pipelines(organization.id)}>
              <Icon iconName="home" />
            </SidebarLink>

            <SidebarLink to={routes.dashboard}>
              <Icon iconName="briefcase" />
            </SidebarLink>
            <SidebarLink to={routes.dashboard}>
              <Icon iconName="key" />
            </SidebarLink>
          </SidebarContentWrapper>
        </Sidebar>
      </div>

      <main className="col-span-2 flex min-h-screen flex-col overflow-x-auto md:col-auto">
        <Outlet />
      </main>
    </div>
  );
}

interface SidebarTopContentProps {
  isCollapsed: boolean;
}
function SidebarTopContent({ isCollapsed }: SidebarTopContentProps) {
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
    <SidebarContentWrapper className="border-b border-neutral-400 py-4 mt-1 ">
      <div ref={menuRef}>
        <button onClick={handleOpen}>
          <Avatar name={name} contentType="text" shape="square" size="md" />
        </button>

        <Menu
          hidden={!showMenu}
          activeKey={`${organization.id}`}
          className="min-w-[248px] absolute top-[60px] left-[85%] max-h-[400px] overflow-y-auto"
          onClick={handleChangeRoute}
        >
          {organizations.map((org) => {
            return <MenuItem key={`${org.id}`}>{org.name}</MenuItem>;
          })}
        </Menu>
      </div>

      <PageOverlay
        className={classNames("transition", {
          "opacity-0 pointer-events-none -z-100": !showMenu,
          "opacity-1 pointer-events-auto z-100": showMenu,
        })}
      />
    </SidebarContentWrapper>
  );
}

function SidebarBottomContent() {
  return (
    <SidebarContentWrapper className="border-t border-neutral-400 py-2">
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
