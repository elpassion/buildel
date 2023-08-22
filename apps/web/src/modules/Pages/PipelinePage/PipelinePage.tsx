import { blockTypesApi } from '~/modules/Pipelines/BlockTypesApi';
import { pipelineApi } from '~/modules/Pipelines/PipelineApi';
import { PipelineBoard } from './PipelineBoard';
import { PipelineHeader } from './PipelineHeader';

export async function PipelinePage(props: { params: { pipelineId: string } }) {
  // const pipeline = await pipelineApi.getPipeline(props.params.pipelineId);
  // const blockTypes = await blockTypesApi.getBlockTypes();

  return (
    <PipelineBoard
      // initialData={pipeline}
      pipelineId={props.params.pipelineId}
    >
      <div className="absolute right-0 top-0">
        <PipelineHeader />
      </div>
    </PipelineBoard>
  );
}
