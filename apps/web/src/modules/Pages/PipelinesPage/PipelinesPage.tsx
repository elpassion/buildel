import { PipelinesApi } from '~/modules/Api';
import { MainContainer } from '~/modules/Layout';
import { PipelinesClient } from './PipelinesClient';
import { PipelinesNavbar } from './PipelinesNavbar';

const pipelinesApi = new PipelinesApi();

export const PipelinesPage = async () => {
  const pipelines = await pipelinesApi.getAll();

  return (
    <>
      <PipelinesNavbar />

      <MainContainer>
        <PipelinesClient pipelines={pipelines.data} />
      </MainContainer>
    </>
  );
};
