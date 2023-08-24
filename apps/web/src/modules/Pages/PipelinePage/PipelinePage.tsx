import { MainContainer } from '~/modules/Layout';
import { blockTypesApi } from '~/modules/Pipelines/BlockTypesApi';
import { pipelineApi } from '~/modules/Pipelines/PipelineApi';
import { PipelineBoard } from './PipelineBoard';
import { PipelineNavbar } from './PipelineNavbar';

export const PipelinePage = async (props: {
  params: { pipelineId: string };
}) => {
  const pipeline = await pipelineApi.getPipeline(props.params.pipelineId);
  const blockTypes = await blockTypesApi.getBlockTypes();

  return (
    <>
      <PipelineNavbar />

      <MainContainer className="!p-0">
        <PipelineBoard
          initialPipeline={pipeline}
          initialBlockTypes={blockTypes}
          pipelineId={props.params.pipelineId}
        />
      </MainContainer>
    </>
  );
};
