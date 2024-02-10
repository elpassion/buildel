import type { PropsWithChildren, ReactNode } from "react";
import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import classNames from "classnames";
import { Button, Icon } from "@elpassion/taco";
import { ItemList } from "~/components/list/ItemList";
import { HiddenField } from "~/components/form/fields/field.context";
import type { IBlockConfig, IConfigConnection } from "../pipeline.types";
import { CreatePipelineSchema } from "~/api/pipeline/pipeline.contracts";
import { SubmitButton } from "~/components/form/submit";

interface WorkflowTemplatesProps extends PropsWithChildren {
  className?: string;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  className,
  children,
}) => {
  return (
    <article
      className={classNames(
        "flex-grow bg-neutral-900 p-4 text-white rounded-lg",
        className
      )}
    >
      {children}
    </article>
  );
};

interface ITemplate {
  id: string | number;
  name: string;
  icon?: ReactNode;
  connections: IConfigConnection[];
  blocks: Partial<Omit<IBlockConfig, "block_type">>[];
}

interface WorkflowTemplatesListProps {
  items: ITemplate[];
  organizationId: string;
}
export function WorkflowTemplatesList({
  items,
  organizationId,
}: WorkflowTemplatesListProps) {
  return (
    <ItemList
      className="flex flex-col gap-2"
      items={items}
      renderItem={(item) => (
        <WorkflowTemplatesListItem {...item} organizationId={organizationId} />
      )}
    />
  );
}

interface ITemplateItem extends ITemplate {
  organizationId: string;
}
function WorkflowTemplatesListItem({
  icon,
  name,
  blocks,
  organizationId,
  connections,
}: ITemplateItem) {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);
  return (
    <ValidatedForm
      method="POST"
      validator={validator}
      action={`/${organizationId}/pipelines/new`}
      className="group p-4 flex items-center justify-between gap-2 bg-neutral-800 hover:bg-neutral-950 rounded-lg text-white h-[60px] transition"
    >
      <div className="flex items-center gap-3">
        {icon ? icon : null}
        <h4 className="text-sm font-medium">{name}</h4>
      </div>

      <HiddenField name="pipeline.name" value={name} />

      <HiddenField
        name="pipeline.config.connections"
        value={JSON.stringify(connections)}
      />

      <HiddenField name="pipeline.config.version" value="1" />

      <HiddenField
        name="pipeline.config.blocks"
        value={JSON.stringify(blocks)}
      />

      <SubmitButton size="xs" className="hidden group-hover:block">
        <div className="flex gap-1 items-center">
          <span className="text-xs">Build</span>
          <Icon iconName="arrow-right" className="text-sm" />
        </div>
      </SubmitButton>
    </ValidatedForm>
  );
}

interface WorkflowTemplatesHeaderProps {
  className?: string;
  heading: ReactNode;
  subheading: ReactNode;
}
export function WorkflowTemplatesHeader({
  className,
  heading,
  subheading,
}: WorkflowTemplatesHeaderProps) {
  return (
    <header className={classNames("text-white mb-4 flex flex-col", className)}>
      <h3 className="text-lg font-medium">{heading}</h3>
      <p className="text-xs">{subheading}</p>
    </header>
  );
}
