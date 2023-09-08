import { redirect } from 'next/navigation';
import { OrganizationsApi } from '~api/Organizations';
import { ROUTES } from '~/modules/Config';

export const DashboardPage = async () => {
  const organizationApi = new OrganizationsApi();

  const organizations = await organizationApi.getAll();

  if (!organizations) redirect(ROUTES.SIGN_IN);

  redirect(ROUTES.ORGANIZATION_PIPELINES(organizations[0]));
};
