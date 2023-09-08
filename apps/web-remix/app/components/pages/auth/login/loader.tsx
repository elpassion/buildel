import { json, LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  return json({});
}
