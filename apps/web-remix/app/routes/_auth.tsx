import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";
import { useEffect } from "react";
import { errorToast } from "~/components/toasts/errorToast";

export async function loader(loaderArgs: LoaderFunctionArgs) {
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
  const { error } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!error) return;

    errorToast({ description: error });
  }, [error]);
  return (
    <main className="w-full min-h-screen flex justify-center items-center bg-neutral-950 p-2">
      <div className="w-full max-w-xl px-6 py-8 bg-neutral-850 rounded-xl">
        <Outlet />
      </div>
    </main>
  );
}
