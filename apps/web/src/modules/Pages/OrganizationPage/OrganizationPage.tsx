import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '~/modules/Config';
import { OrganizationsApi } from '~api/Organizations';

interface OrganizationPageProps {
  params: {
    organizationId: string;
  };
  searchParams: Record<string, any>;
}
export const OrganizationPage = async ({ params }: OrganizationPageProps) => {
  const organizationApi = new OrganizationsApi();

  const organization = await organizationApi.get(params.organizationId);

  if (!organization) notFound();

  redirect(ROUTES.ORGANIZATION_PIPELINES(params.organizationId));
};
