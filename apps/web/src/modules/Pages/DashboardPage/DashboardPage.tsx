import { redirect } from 'next/navigation';
import { ROUTES } from '~/modules/Config';
import { OrganizationsApi } from '~api/Organizations';

export const DashboardPage = async () => {
  const organizationApi = new OrganizationsApi();

  const organizations = await organizationApi.getAll();

  if (!organizations) redirect(ROUTES.SIGN_IN);

  redirect(ROUTES.ORGANIZATION_PIPELINES(organizations[0]));
};
