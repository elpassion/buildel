import { MetaFunction } from "@remix-run/node";

export function OverviewPage() {
  return <h1>Overview</h1>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Pipeline overview",
    },
  ];
};
