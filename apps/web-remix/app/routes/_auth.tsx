import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useServerToasts } from "~/hooks/useServerToasts";
import { getServerToast } from "~/utils/toast.server";
import { loaderBuilder } from "~/utils.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }) => {
    const { cookie, ...toasts } = await getServerToast(request);

    return json(
      { toasts },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  })(loaderArgs);
}

export default function Layout() {
  const { toasts } = useLoaderData<typeof loader>();

  useServerToasts(toasts);

  return (
    <main className="w-full min-h-screen flex justify-center items-center bg-neutral-950 p-2">
      <div className="w-full max-w-xl px-6 py-8 bg-neutral-850 rounded-xl">
        <Outlet />
      </div>
    </main>
  );
}
