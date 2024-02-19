import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  invariant(token, "Token is required");
  return json({ token });
}
