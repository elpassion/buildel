import { MetaFunction } from "@remix-run/node";

export function ApiKeysPage() {
  return <h1>Api Keys</h1>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Api keys",
    },
  ];
};
