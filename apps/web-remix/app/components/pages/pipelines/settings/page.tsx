import { MetaFunction } from "@remix-run/node";

export function SettingsPage() {
  return <h1>Settings</h1>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
