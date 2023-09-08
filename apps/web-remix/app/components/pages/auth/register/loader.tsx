import { json, LoaderArgs, redirect } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  requireNotLogin(request);
  return json({});
}
