import { Suspense } from 'react';
import { MainContainer } from '~/modules/Layout';
import { PipelinesClient } from './PipelinesClient';
import { PipelinesNavbar } from './PipelinesNavbar';
import { PipelinesListWrapper } from '~pages/PipelinesPage/PipelinesListWrapper';
export const PipelinesPage = async () => {
  return (
    <>
      <PipelinesNavbar />

      <MainContainer>
        <PipelinesClient />

        {/*to improve*/}
        <Suspense fallback={<p>Loading...</p>}>
          <PipelinesListWrapper />
        </Suspense>
      </MainContainer>
    </>
  );
};
