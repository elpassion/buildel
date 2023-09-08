import { json, LoaderArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  requireLogin(request);

  const pipelines = await fetch(
    "http://127.0.0.1:4000/api/organizations/1/pipelines",
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie")!,
      },
    }
  ).then((res) => res.json());

  return json({ pipelines });
}
