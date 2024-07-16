import type { MetaFunction } from "@remix-run/node";

export function AcceptPage() {
  return null;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Accept",
    },
  ];
};
