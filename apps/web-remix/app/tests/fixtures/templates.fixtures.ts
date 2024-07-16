import type { IWorkflowTemplate } from "~/api/organization/organization.contracts";

export const templateFixture = (
  override?: Partial<IWorkflowTemplate>
): IWorkflowTemplate => {
  return {
    name: "Speech To Text",
    template_name: "speech_to_text",
    ...override,
  };
};
