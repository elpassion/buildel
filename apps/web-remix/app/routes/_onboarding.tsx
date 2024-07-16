import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireLogin } from "~/session.server";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
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
