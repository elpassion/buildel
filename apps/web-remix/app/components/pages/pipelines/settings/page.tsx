import { V2_MetaFunction } from "@remix-run/node";

export function SettingsPage() {
  return <h1>Settings</h1>;
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
