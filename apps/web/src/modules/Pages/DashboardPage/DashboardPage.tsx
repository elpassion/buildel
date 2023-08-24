import { MainContainer } from '~/modules/Layout';
import { DashboardNavbar } from './DashboardNavbar';

export const DashboardPage = () => {
  return (
    <>
      <DashboardNavbar />

      <MainContainer>
        <p className="text-2xl">Dashboard page</p>
      </MainContainer>
    </>
  );
};
