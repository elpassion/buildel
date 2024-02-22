import { IAsyncSelectItem } from "~/api/AsyncSelectApi";

export const secretFixture = (
  override?: Partial<IAsyncSelectItem>
): IAsyncSelectItem => {
  return {
    id: "OPENAI",
    name: "OPENAI",
    ...override,
  };
};
