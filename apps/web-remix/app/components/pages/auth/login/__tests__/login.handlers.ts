import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/super-api/users/log_in", () => {
    return HttpResponse.json(null, {
      headers: {
        "Set-Cookie":
          "_buildel_key=123; path=/; secure; HttpOnly; SameSite=Lax",
      },
    });
  }),
  http.get("/super-api/users/me", () => {
    return HttpResponse.json({ data: { id: 1 } }, { status: 200 });
  }),
];
