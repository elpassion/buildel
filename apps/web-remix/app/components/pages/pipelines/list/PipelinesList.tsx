import React from "react";
import { ItemList } from "~/components/list/ItemList";
import type { IPipeline } from "./pipelines.types";
import {
  PipelineListItemFooter,
  PipelineListItemHeader,
  PipelinesListItem,
} from "./PipelinesListItem";
import classNames from "classnames";
interface PipelinesListProps {
  pipelines: IPipeline[];
  className?: string;
}

export const PipelinesList: React.FC<PipelinesListProps> = ({
  pipelines,
  className,
}) => {
  return (
    <ItemList
      items={pipelines}
      renderItem={(item) => (
        <PipelinesListItem className="flex flex-col gap-3">
          <PipelineListItemHeader pipeline={item} />
          <PipelineListItemFooter pipeline={item} />
        </PipelinesListItem>
      )}
      className={classNames("flex flex-col gap-2", className)}
    />
  );
};
