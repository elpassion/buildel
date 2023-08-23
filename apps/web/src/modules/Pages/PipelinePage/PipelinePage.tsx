import { MainContainer } from '~/modules/Layout';
import { pipelineApi } from '~/modules/Pipelines/PipelineApi';
import { PipelineBoard } from './PipelineBoard';
import { PipelineNavbar } from './PipelineNavbar';

export const PipelinePage = async (props: {
  params: { pipelineId: string };
}) => {
  const pipeline = await pipelineApi.getPipeline(props.params.pipelineId);

  return (
    <>
      <PipelineNavbar />

      <MainContainer className="!p-0">
        <PipelineBoard
          initialData={pipeline}
          pipelineId={props.params.pipelineId}
        />
      </MainContainer>
    </>
  );
};
