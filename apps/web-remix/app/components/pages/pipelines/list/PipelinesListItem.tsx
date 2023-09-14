import { Link, Form } from "@remix-run/react";
import { Icon, IconButton, Indicator } from "@elpassion/taco";
import { IPipeline } from "./pipelines.types";
import { HiddenField } from "~/components/form/fields/field.context";
import { routes } from "~/utils/routes.utils";

interface PipelinesListItemProps {
  pipeline: IPipeline;
}
export const PipelinesListItem = ({ pipeline }: PipelinesListItemProps) => {
  return (
    <article className="bg-white px-6 py-4 rounded">
      <header className="flex items-center text-neutral-700">
        <div className="flex flex-grow">
          <Link
            to={routes.pipeline(pipeline.organization_id, pipeline.id)}
            className="text-lg font-semibold hover:underline"
          >
            {pipeline.name}
          </Link>
        </div>
        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm">$2.45</p>
          </div>
          <div>
            <p className="text-sm">113 runs</p>
          </div>
          <div>
            <Indicator variant="badge" type="success" text="Active" />
          </div>
        </div>
      </header>

      <div className="mb-3" />

      <div className="flex justify-between">
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
        <Form method="delete">
          <IconButton
            size="xs"
            type="submit"
            variant="outlined"
            ariaLabel="Delete"
            title={`Remove workflow: ${pipeline.name}`}
            icon={<Icon iconName="x" />}
          />
          <HiddenField name="pipelineId" value={pipeline.id} />
        </Form>
      </div>
    </article>
  );
};
