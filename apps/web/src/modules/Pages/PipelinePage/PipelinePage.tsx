import { PipelineClient } from './PipelineClient';

export const PipelinePage = (props: { params: { pipelineId: string } }) => {
  return (
    <>
      <PipelineClient {...props} />
    </>
  );
};
