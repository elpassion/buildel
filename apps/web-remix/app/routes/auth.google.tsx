import { redirect } from "@remix-run/node";
import { OAuth2Client } from "google-auth-library";

export const action = async () => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    prompt: "select_account",
  });

  return redirect(authorizeUrl);
};
