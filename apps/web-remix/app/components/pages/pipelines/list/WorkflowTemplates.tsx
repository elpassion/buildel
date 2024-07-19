import type { PropsWithChildren, ReactNode } from 'react';
import React, { useMemo, useRef } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import classNames from 'classnames';
import { PlusCircle } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import type { IWorkflowTemplate } from '~/api/organization/organization.contracts';
import { CreateFromTemplateSchema } from '~/api/organization/organization.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { ItemList } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';

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
        'flex-grow bg-white border border-neutral-100 px-4 py-8 rounded-3xl flex flex-col gap-6 md:flex-row md:gap-14 md:justify-between md:p-16',
        className,
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
    [],
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
  const ref = useRef<HTMLFormElement>(null);
  const validator = useMemo(() => withZod(CreateFromTemplateSchema), []);
  return (
    <ValidatedForm
      formRef={ref}
      method="POST"
      validator={validator}
      onClick={() => ref.current?.submit()}
      className="group p-2 flex items-center justify-between gap-2 bg-white border border-neutral-100 h-[80px] rounded-xl transition hover:border-blue-200 cursor-pointer md:p-4"
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'min-w-10 w-10 h-10 bg-orange-400 rounded-xl flex-shrink-0 flex justify-center items-center',
            getTemplateImageColor(item.template_name),
          )}
        >
          <img
            src={resolveImageUrl(item.template_name)}
            alt={`${item.name} icon`}
            className="text-foreground w-4"
          />
        </div>

        <div>
          <h4 className="group-hover:text-blue-500 text-base font-bold mb-1 transition">
            {item.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {item.template_description}
          </p>
        </div>
      </div>

      <HiddenField name="template_name" value={item.template_name} />
    </ValidatedForm>
  );
}

export function DefaultTemplateItem() {
  return (
    <div className="group p-4 flex items-center justify-between gap-2 bg-white border border-neutral-100 h-[80px] rounded-xl transition hover:border-blue-200 cursor-pointer">
      <div className="flex gap-3">
        <div
          className={cn(
            'min-w-10 w-10 h-10 bg-orange-400 rounded-xl flex-shrink-0 flex justify-center items-center',
            getTemplateImageColor(),
          )}
        >
          <PlusCircle className="text-white w-5 h-5" />
        </div>

        <div>
          <h4 className="group-hover:text-blue-500 text-base font-bold mb-1 transition">
            Empty project
          </h4>
          <p className="text-xs text-muted-foreground">
            Create your own workflow from scratch
          </p>
        </div>
      </div>
    </div>
  );
}

export function getTemplateImageColor(name?: string) {
  switch (name) {
    case 'text_to_speech':
      return 'bg-pink-500';
    case 'speech_to_text':
      return 'bg-blue-600';
    case 'ai_chat':
      return 'bg-orange-500';
    case 'knowledge_search_to_text':
      return 'bg-green-500';
    default:
      return 'bg-neutral-950';
  }
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
    <header
      className={classNames(
        'flex flex-col gap-4 md:gap-6 md:text-left md:max-w-[280px]',
        className,
      )}
    >
      <h3 className="text-xl md:text-3xl font-medium">{heading}</h3>
      <p className="text-sm md:text-base text-muted-foreground">{subheading}</p>
    </header>
  );
}

function resolveImageUrl(name: string) {
  return `/templates/${name}.svg`;
}
