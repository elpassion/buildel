import { http, HttpResponse } from "msw";
import { IAsyncSelectItemList } from "~/api/AsyncSelectApi";
import { secretsFixtures } from "~/tests/fixtures/secrets.fixtures";
import { modelsFixtures } from "~/tests/fixtures/models.fixtures";

export const asyncSelectHandlers = () => {
  return [
    http.get("/super-api/organizations/:organizationId/secrets", () => {
      return HttpResponse.json<{ data: IAsyncSelectItemList }>(
        { data: secretsFixtures() },
        { status: 200 }
      );
    }),

    http.get("/super-api/organizations/:organizationId/models", () => {
      return HttpResponse.json<{ data: IAsyncSelectItemList }>(
        { data: modelsFixtures() },
        { status: 200 }
      );
    }),
  ];
};
