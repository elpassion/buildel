import { ResponsiveSidebar } from "@elpassion/taco";
import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div className="grid h-screen grid-cols-[auto_1fr]">
      <ResponsiveSidebar
        sidebarClassName="sticky top-0 bg-white border-r border-gray-200"
        collapseBtnClassName="absolute top-11 -right-2"
        topContent={<SidebarTopContent />}
      >
        TEST
      </ResponsiveSidebar>
      <div className="col-span-2 flex min-h-screen flex-col overflow-x-auto md:col-auto">
        <Outlet />
      </div>
    </div>
  );
}

function SidebarTopContent() {
  const name = "ACME inc.";

  return (
    <div className="min-h-smNavbar border-b">
      <div className={"flex h-full w-full items-center"}>
        <h1 className="font-medium text-neutral-500">{name}</h1>
      </div>
    </div>
  );
}
