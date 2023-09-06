import { MainContainer } from '~/modules/Layout';
import { OrganizationsClient } from './OrganizationsClient';
import { OrganizationsNavbar } from './OrganizationsNavbar';

export const OrganizationsPage = () => {
  return (
    <>
      <OrganizationsNavbar />

      <MainContainer>
        <OrganizationsClient />
      </MainContainer>
    </>
  );
};
