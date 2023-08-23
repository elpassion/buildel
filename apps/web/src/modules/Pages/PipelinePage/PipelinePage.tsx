import { MainContainer } from '~/modules/Layout';
import { PipelineBoard } from './PipelineBoard';
import { PipelineNavbar } from './PipelineNavbar';

export const PipelinePage = (props: { params: { pipelineId: string } }) => {
  return (
    <>
      <PipelineNavbar />

      <MainContainer>
        <PipelineBoard
          // initialData={pipeline}
          pipelineId={props.params.pipelineId}
        />
      </MainContainer>
    </>
  );
};
