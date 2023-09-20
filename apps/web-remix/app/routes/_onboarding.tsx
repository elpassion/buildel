import { LoaderArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireLogin } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireLogin(request);
  return json({});
}

export default function Layout() {
  return (
    <div id="_root" className="bg-neutral-950 min-h-screen w-full">
      <Outlet />
    </div>
  );
}
