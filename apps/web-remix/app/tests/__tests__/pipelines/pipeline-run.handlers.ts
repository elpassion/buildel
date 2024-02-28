import { http, HttpResponse } from "msw";

export const runHandlers = () => {
  return [
    http.post("/super-api/channel_auth", () => {
      return HttpResponse.json(
        {
          auth: "RFQR5Z/HvD0tq0r7SmHiVzYOPDj1c3N/htipn2226Nk=",
          user_data: { id: 1 },
        },
        { status: 200 }
      );
    }),
  ];
};
