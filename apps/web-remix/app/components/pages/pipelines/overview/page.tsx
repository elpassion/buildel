import { V2_MetaFunction } from "@remix-run/node";

export function OverviewPage() {
  return <h1>Overview</h1>;
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipeline",
    },
  ];
};
