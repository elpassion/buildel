import { json, LoaderArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const userId = cookie?.split("_buildel_key=")[1];
  if (userId) return redirect("/");
  return json({});
}
