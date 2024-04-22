import type { PropsWithChildren, ReactNode } from "react";
import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { ItemList } from "~/components/list/ItemList";
import { SubmitButton } from "~/components/form/submit";
import {
  CreateFromTemplateSchema,
  IWorkflowTemplate,
} from "~/api/organization/organization.contracts";
import { HiddenField } from "~/components/form/fields/field.context";

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

interface WorkflowTemplatesListProps {
  items: IWorkflowTemplate[];
  organizationId: string;
}
export function WorkflowTemplatesList({
  items,
  organizationId,
}: WorkflowTemplatesListProps) {
  const formattedTemplates = useMemo(
    () => items.map((template) => ({ ...template, id: template.name })),
    []
  );
  return (
    <ItemList
      className="flex flex-col gap-2"
      items={formattedTemplates}
      renderItem={(item) => (
        <WorkflowTemplatesListItem
          item={item}
          organizationId={organizationId}
        />
      )}
    />
  );
}

interface ITemplateItem {
  organizationId: string;
  item: IWorkflowTemplate;
}
function WorkflowTemplatesListItem({ item }: ITemplateItem) {
  const validator = useMemo(() => withZod(CreateFromTemplateSchema), []);
  return (
    <ValidatedForm
      method="POST"
      validator={validator}
      className="group p-4 flex items-center justify-between gap-2 bg-neutral-800 hover:bg-neutral-950 rounded-lg text-white h-[60px] transition"
    >
      <div className="flex items-center gap-3">
        <img
          src={resolveImageUrl(item.template_name)}
          alt={`${item.name} icon`}
        />
        <h4 className="text-sm font-medium">{item.name}</h4>
      </div>

      <HiddenField name="template_name" value={item.template_name} />

      <SubmitButton
        size="xs"
        className="opacity-0 group-hover:opacity-100"
        aria-label={`Create workflow: ${item.name}`}
      >
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

function resolveImageUrl(name: string) {
  return `/templates/${name}.svg`;
}
