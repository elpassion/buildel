import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div id="_root" className="bg-neutral-950 min-h-screen w-full">
      <Outlet />
    </div>
  );
}
