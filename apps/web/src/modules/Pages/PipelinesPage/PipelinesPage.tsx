import { MainContainer } from '~/modules/Layout';
import { PipelinesClient } from './PipelinesClient';
import { PipelinesNavbar } from './PipelinesNavbar';

export const PipelinesPage = async () => {
  return (
    <>
      <PipelinesNavbar />

      <MainContainer>
        <PipelinesClient />
      </MainContainer>
    </>
  );
};
