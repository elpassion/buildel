import invariant from "tiny-invariant";
import classNames from "classnames";
import Modal from "react-modal";
import { Button, Sidebar, WorkspaceItem } from "@elpassion/taco";
import { LoaderArgs, json } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { OrganizationsResponse } from "~/components/pages/organizations/contracts";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";
import { useCallback, useState } from "react";

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
          className="sticky top-0 !h-[calc(100vh-32px)] min-w-[80px] rounded-[1.25rem]"
          collapseBtnClassName="absolute top-[60px] -right-2"
          topContent={<SidebarTopContent isCollapsed={collapsed} />}
          bottomContent={<LogoutButton />}
          onCollapse={toggleCollapse}
          collapsed={collapsed}
          collapseButton={false}
        >
          <OrganizationsLinks />
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
  const { organization } = useLoaderData<typeof loader>();
  const name = organization.name;

  return (
    <div className="border-b border-neutral-400 py-2">
      <Link to={routes.pipelines(organization.id)}>
        <WorkspaceItem
          name={name}
          variant={isCollapsed ? "onlyIcon" : "fitWidth"}
          shape="square"
          size="md"
        />
      </Link>
    </div>
  );
}

function LogoutButton() {
  const logout = useFetcher();

  return (
    <Button
      variant="outlined"
      onClick={() => {
        logout.submit({}, { method: "DELETE", action: "/logout" });
      }}
    >
      Logout
    </Button>
  );
}
function OrganizationsLinks() {
  const { organizations } = useLoaderData<typeof loader>();

  return organizations.map((org) => (
    <NavLink
      key={org.id}
      to={routes.organization(org.id)}
      className={({ isActive }) =>
        classNames({
          "text-red-500": isActive,
        })
      }
    >
      <p>{org.name}</p>
    </NavLink>
  ));
}
