import { ResponsiveSidebar } from "@elpassion/taco";
import { LoaderArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import Modal from "react-modal";

Modal.setAppElement("#_root");
export async function loader(loaderArgs: LoaderArgs) {
  return loaderBuilder(async ({ request }) => {
    const { cookie, error } = await getToastError(request);

    return json(
      { error },
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
    <div id="_root" className="grid h-screen grid-cols-[auto_1fr]">
      <ResponsiveSidebar
        sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
        collapseBtnClassName="absolute top-11 -right-2"
        topContent={<SidebarTopContent />}
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
  const name = "ACME inc.";
  const { error } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-smNavbar border-b">
      <div className={"flex h-full w-full items-center"}>
        <h1 className="font-medium text-neutral-500">{name}</h1>
        {error && <div>{error}</div>}
      </div>
    </div>
  );
}
