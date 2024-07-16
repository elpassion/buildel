import { HttpResponse, http } from "msw";

export const handlers = [
  http.post("/super-api/users/password/reset", () => {
    return HttpResponse.json(null, { status: 200 });
  }),
  http.put("/super-api/users/password/reset", () => {
    return HttpResponse.json(null, { status: 200 });
  }),
];

export const notMatchHandler = http.put(
  "/super-api/users/password/reset",
  () => {
    return HttpResponse.json(
      { errors: { password_confirmation: "does not match password" } },
      { status: 422 }
    );
  }
);
