import { redirect } from 'next/navigation';
import { ROUTES } from '~/modules/Config';
import { MainContainer } from '~/modules/Layout';
import { DashboardNavbar } from './DashboardNavbar';
import { OrganizationsApi } from '~api/Organizations';

export const DashboardPage = async () => {
  const organizationApi = new OrganizationsApi();

  const organizations = await organizationApi.getAll();

  redirect(ROUTES.ORGANIZATION_PIPELINES(organizations[0]));

  // return (
  //   <>
  //     <DashboardNavbar />
  //
  //     <MainContainer>
  //       <p className="text-2xl">Dashboard page</p>
  //     </MainContainer>
  //   </>
  // );
};
