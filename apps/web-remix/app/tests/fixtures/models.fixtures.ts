import { IAsyncSelectItemList } from "~/api/AsyncSelectApi";

export const modelsFixtures = (): IAsyncSelectItemList => {
  return [
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
    },
    {
      id: "gpt-3.5-turbo-0125",
      name: "GPT-3.5 Turbo Preview",
    },
    {
      id: "gpt-4-turbo-preview",
      name: "GPT-4 Turbo Preview",
    },
  ];
};
