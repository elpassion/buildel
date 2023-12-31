import React from "react";
import { ItemList } from "~/components/list/ItemList";
import type { IPipeline } from "./pipelines.types";
import { PipelineListItemHeader, PipelinesListItem } from "./PipelinesListItem";
import classNames from "classnames";
import { Link } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
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
        <Link to={routes.pipeline(item.organization_id, item.id)}>
          <PipelinesListItem className="flex flex-col gap-1">
            <PipelineListItemHeader pipeline={item} />
          </PipelinesListItem>
        </Link>
      )}
      className={classNames("flex flex-col gap-2", className)}
    />
  );
};
