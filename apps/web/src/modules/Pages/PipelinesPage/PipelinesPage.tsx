import { Suspense } from 'react';
import { MainContainer } from '~/modules/Layout';
import { PipelinesHeader } from './PipelinesHeader';
import { PipelinesListWithInitialData } from './PipelinesListWithInitialData';
import { PipelinesNavbar } from './PipelinesNavbar';
export const PipelinesPage = async () => {
  return (
    <>
      <PipelinesNavbar />

      <MainContainer>
        <PipelinesHeader />

        <Suspense fallback={<p>Loading...</p>}>
          <PipelinesListWithInitialData />
        </Suspense>
      </MainContainer>
    </>
  );
};
