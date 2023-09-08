import { json, LoaderArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { PipelinesResponse } from "./contracts";
import { fetchTyped } from "~/utils.server";

export async function loader({ request }: LoaderArgs) {
  requireLogin(request);

  const pipelines = await fetchTyped(
    PipelinesResponse,
    "http://127.0.0.1:4000/api/organizations/1/pipelines",
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie")!,
      },
    }
  );

  return json({ pipelines });
}
