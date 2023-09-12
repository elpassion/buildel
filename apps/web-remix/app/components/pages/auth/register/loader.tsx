import { json, LoaderArgs } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireNotLogin(request);
  return json({});
}
