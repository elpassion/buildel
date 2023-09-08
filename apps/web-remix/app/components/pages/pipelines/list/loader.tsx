import { json, LoaderArgs, redirect } from "@remix-run/node";
import { requireLogin } from "~/session.server";
import { PipelinesResponse } from "./contracts";
import { fetchTyped } from "~/utils.server";
import invariant from "tiny-invariant";

export async function loader({ request, params }: LoaderArgs) {
  requireLogin(request);
  invariant(params.organizationId, "organizationId not found");

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

  return json({ pipelines, organizationId: params.organizationId });
}
