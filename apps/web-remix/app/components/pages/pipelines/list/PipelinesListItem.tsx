import { Link, Form } from "@remix-run/react";
import { Icon, Indicator, IconButton } from "@elpassion/taco";
import { IPipeline } from "./pipelines.types";
import { routes } from "~/utils/routes.utils";
import { PropsWithChildren } from "react";
import classNames from "classnames";
import { HiddenField } from "~/components/form/fields/field.context";

interface PipelinesListItemProps extends PropsWithChildren {
  className?: string;
}
export const PipelinesListItem = ({
  children,
  className,
}: PipelinesListItemProps) => {
  return (
    <article
      className={classNames(
        "bg-neutral-800 px-6 py-4 rounded-lg text-basic-white",
        className
      )}
    >
      {children}
    </article>
  );
};

interface PipelineListItemHeaderProps {
  pipeline: IPipeline;
}
export const PipelineListItemHeader = ({
  pipeline,
}: PipelineListItemHeaderProps) => {
  return (
    <header className="flex items-start">
      <Link
        to={routes.pipeline(pipeline.organization_id, pipeline.id)}
        className="flex basis-1/2 text-lg font-medium hover:underline"
      >
        {pipeline.name}
      </Link>

      <div className="flex items-center basis-1/2 justify-between">
        <p className="text-sm">$2.45</p>

        <p className="text-sm">{pipeline.runs_count} runs</p>

        <Indicator variant="badge" type="success" text="Active" />
      </div>
    </header>
  );
};

export const PipelineListItemFooter = ({
  pipeline,
}: PipelineListItemHeaderProps) => {
  return (
    <footer className="flex justify-between text-basic-white">
      <div className="flex gap-6">
        <div className="flex gap-2">
          <Icon iconName="zap" size="xs" />
          <p className="text-xs">Zapier API</p>
        </div>
        <div className="flex gap-2">
          <Icon iconName="arrow-right" size="xs" />
          <p className="text-xs">Sequence</p>
        </div>
      </div>
      {/*<Form method="delete">*/}
      {/*  <IconButton*/}
      {/*    size="xs"*/}
      {/*    type="submit"*/}
      {/*    variant="outlined"*/}
      {/*    ariaLabel="Delete"*/}
      {/*    title={`Remove workflow: ${pipeline.name}`}*/}
      {/*    icon={<Icon iconName="x" />}*/}
      {/*  />*/}
      {/*  <HiddenField name="pipelineId" value={pipeline.id} />*/}
      {/*</Form>*/}
    </footer>
  );
};
