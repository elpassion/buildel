export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await fetch("http://127.0.0.1:4000/api/users/log_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (response.status === 404) {
    throw new Error("User not found");
  }

  const json = await response.json();

  const cookie = response.headers.get("Set-Cookie");

  return { json, cookie };
}
