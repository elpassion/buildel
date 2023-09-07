import { Layout, MainContainer } from '~/modules/Layout';
import { DashboardNavbar } from './DashboardNavbar';

export const DashboardPage = () => {
  return (
    <Layout>
      <DashboardNavbar />

      <MainContainer>
        <p className="text-2xl">Dashboard page</p>
      </MainContainer>
    </Layout>
  );
};
