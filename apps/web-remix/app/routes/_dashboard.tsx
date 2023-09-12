import { Button, ResponsiveSidebar } from "@elpassion/taco";
import { LoaderArgs, json } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import Modal from "react-modal";
import invariant from "tiny-invariant";
import { z } from "zod";
import { requireLogin } from "~/session.server";

Modal.setAppElement("#_root");
export async function loader(loaderArgs: LoaderArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    const { cookie, error } = await getToastError(request);

    const response = await fetch(
      OrganizationsResponse,
      `/organizations/${params.organizationId}`
    );

    return json(
      { error, organization: response.data.data },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  })(loaderArgs);
}

const OrganizationsResponse = z.object({
  data: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export default function Layout() {
  const logout = useFetcher();
  return (
    <div id="_root" className="grid h-screen grid-cols-[auto_1fr]">
      <ResponsiveSidebar
        sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
        collapseBtnClassName="absolute top-11 -right-2"
        topContent={<SidebarTopContent />}
        bottomContent={
          <Button
            variant="outlined"
            onClick={() => {
              logout.submit({}, { method: "DELETE", action: "/logout" });
            }}
          >
            Logout
          </Button>
        }
      >
        TEST
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
