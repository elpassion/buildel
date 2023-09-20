import { V2_MetaFunction } from "@remix-run/node";

export function InterfacePage() {
  return <h1>Interface</h1>;
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Interface",
    },
  ];
};
