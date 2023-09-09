import { LoaderArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { loaderBuilder } from "~/utils.server";
import { getToastError } from "~/utils/toast.error.server";

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
  const { error } = useLoaderData<typeof loader>();

  return (
    <div>
      {error && <div>{error}</div>}
      LOGIN
      <Outlet />
    </div>
  );
}
