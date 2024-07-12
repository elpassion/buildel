import { redirect } from "@remix-run/node";
import { assert } from "~/utils/assert";

export const action = async () => {
  assert(process.env.GITHUB_CLIENT_ID, "Missing GITHUB_CLIENT_ID");
  assert(process.env.GITHUB_CLIENT_SECRET, "Missing GITHUB_CLIENT_SECRET");
  assert(process.env.GITHUB_REDIRECT_URI, "Missing GITHUB_REDIRECT_URI");

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", process.env.GITHUB_REDIRECT_URI);
  authUrl.searchParams.append("scope", "user:email");

  return redirect(authUrl.toString());
};
