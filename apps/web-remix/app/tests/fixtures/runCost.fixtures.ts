import type { IPipelineCost } from "~/components/pages/pipelines/pipeline.types";

export const runCostFixture = (
  override?: Partial<IPipelineCost>
): IPipelineCost => {
  return {
    amount: "0.0000200000",
    created_at: "2024-02-26T14:53:06",
    description: "chat_1",
    input_tokens: 0,
    output_tokens: 9,
    id: 1,
    ...override,
  };
};
