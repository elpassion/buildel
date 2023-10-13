import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function SettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return <p className="text-white">user: {user.id}</p>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
