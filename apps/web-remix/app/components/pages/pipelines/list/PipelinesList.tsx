import React from "react";
import { ItemList } from "~/components/list/ItemList";
import type { IPipeline } from "../pipeline.types";
import { PipelineListItemHeader, PipelinesListItem } from "./PipelinesListItem";
import classNames from "classnames";
import { routes } from "~/utils/routes.utils";
import { BasicLink } from "~/components/link/BasicLink";

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
        <BasicLink to={routes.pipelineBuild(item.organization_id, item.id)}>
          <PipelinesListItem className="flex flex-col gap-1">
            <PipelineListItemHeader pipeline={item} />
          </PipelinesListItem>
        </BasicLink>
      )}
      className={classNames("flex flex-col gap-2", className)}
    />
  );
};
