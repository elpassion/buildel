import { json } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireNotLogin(request);
  return json({});
}
