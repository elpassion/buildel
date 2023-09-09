import { LoaderArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { commitSession, getRemixSession } from "~/session.server";

export async function loader(loaderArgs: LoaderArgs) {
  const session = await getRemixSession(
    loaderArgs.request.headers.get("Cookie")
  );

  return json(
    {
      error: session.get("error"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
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
