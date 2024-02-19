import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireNotLogin(request);
  return json({ googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID });
}
