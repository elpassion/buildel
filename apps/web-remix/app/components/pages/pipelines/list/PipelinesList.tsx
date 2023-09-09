import React from "react";
import { ItemList } from "~/components/list/ItemList";
import { PipelinesListItem } from "./PipelinesListItem";
import { IPipeline } from "./contracts";
interface PipelinesListProps {
  pipelines: IPipeline[];
}

export const PipelinesList: React.FC<PipelinesListProps> = ({ pipelines }) => {
  return (
    <ItemList
      items={pipelines}
      renderItem={(item) => <PipelinesListItem pipeline={item} />}
      className="flex flex-col gap-3"
    />
  );
};
