import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { OAuth2Client } from "~/clients/OAuth2Client";
import { CurrentUserResponse } from "~/api/CurrentUserApi";
import { setCurrentUser } from "~/utils/currentUser.server";
import { routes } from "~/utils/routes.utils";
import { loaderBuilder } from "~/utils.server";
import z from "zod";
import { assert } from "~/utils/assert";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    assert(process.env.GOOGLE_CLIENT_ID);
    assert(process.env.GOOGLE_CLIENT_SECRET);

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const url = new URL(request.url);

    const token = await oAuth2Client.getToken(url.searchParams.get("code")!);

    const response = await fetch(z.any(), "/users/google/log_in", {
      method: "POST",
      body: JSON.stringify({ token: token.tokens.id_token }),
    });

    const authCookie = response.headers.get("Set-Cookie")!;

    const meResponse = await fetch(CurrentUserResponse, "/users/me", {
      headers: {
        Cookie: authCookie,
      },
    });

    const sessionCookie = await setCurrentUser(request, meResponse.data);

    const headers = new Headers();
    headers.append("Set-Cookie", authCookie);
    headers.append("Set-Cookie", sessionCookie);

    return redirect(routes.dashboard, {
      headers,
    });
  })(args);
}
