import { MainContainer } from '~/modules/Layout';
import { OrganizationNavbar } from './OrganizationNavbar';

export const OrganizationPage = () => {
  return (
    <>
      <OrganizationNavbar />

      <MainContainer>
        <p className="text-2xl">Organization page</p>
      </MainContainer>
    </>
  );
};
