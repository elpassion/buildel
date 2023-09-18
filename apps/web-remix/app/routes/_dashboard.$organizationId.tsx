import invariant from "tiny-invariant";
import classNames from "classnames";
import Modal from "react-modal";
import { Button, ResponsiveSidebar } from "@elpassion/taco";
import { LoaderArgs, json } from "@remix-run/node";
import { NavLink, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { OrganizationsResponse } from "~/components/pages/organizations/contracts";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import { requireLogin } from "~/session.server";
import { routes } from "~/utils/routes.utils";

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
  return (
    <div
      id="_root"
      className="grid h-screen grid-cols-[auto_1fr] bg-neutral-950"
    >
      <ResponsiveSidebar
        sidebarClassName="sticky top-0"
        collapseBtnClassName="absolute top-11 -right-2"
        topContent={<SidebarTopContent />}
        bottomContent={<LogoutButton />}
      >
        <OrganizationsLinks />
      </ResponsiveSidebar>

      <main className="col-span-2 flex min-h-screen flex-col overflow-x-auto md:col-auto">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarTopContent() {
  const { error, organization } = useLoaderData<typeof loader>();
  const name = organization.name;

  return (
    <div className="min-h-smNavbar border-b">
      <div className={"flex h-full w-full items-center"}>
        <h1 className="font-medium text-neutral-500">{name}</h1>
        {error && <div>{error}</div>}
      </div>
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
