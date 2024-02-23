import { IOrganization } from "~/api/organization/organization.contracts";

export const organizationFixture = (
  override?: Partial<IOrganization>
): IOrganization => {
  return { id: 1, name: "New org", ...override };
};
