import type { PropsWithChildren, ReactNode } from 'react';
import React, { useMemo, useRef } from 'react';
import { PlusCircle } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import type { IWorkflowTemplate } from '~/api/organization/organization.contracts';
import { CreateFromTemplateSchema } from '~/api/organization/organization.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { ItemList } from '~/components/list/ItemList';
import {
  WorkflowBlockList,
  WorkflowBlockListOverflow,
} from '~/components/pages/pipelines/components/WorkflowBlockList';
import { cn } from '~/utils/cn';
import { withZod } from '~/utils/form';

interface WorkflowTemplatesProps extends PropsWithChildren {
  className?: string;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  className,
  children,
}) => {
  return (
    <article
      className={cn(
        'flex-grow bg-white border border-neutral-100 px-4 py-8 rounded-3xl flex flex-col gap-4 md:justify-between md:p-16',
        className,
      )}
    >
      {children}
    </article>
  );
};

interface WorkflowTemplatesListProps {
  items: IWorkflowTemplate[];
  action?: string;
}
export function WorkflowTemplatesList({
  items,
  action,
}: WorkflowTemplatesListProps) {
  const formattedTemplates = useMemo(
    () => items.map((template) => ({ ...template, id: template.name })),
    [items],
  );
  return (
    <ItemList
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      items={formattedTemplates}
      renderItem={(item) => (
        <WorkflowTemplatesListItem action={action} item={item} />
      )}
    />
  );
}

interface ITemplateItem {
  item: IWorkflowTemplate;
  action?: string;
}
function WorkflowTemplatesListItem({ item, action }: ITemplateItem) {
  const ref = useRef<HTMLFormElement>(null);
  const validator = useMemo(() => withZod(CreateFromTemplateSchema), []);
  return (
    <ValidatedForm
      formRef={ref}
      action={action}
      method="POST"
      validator={validator}
      onClick={() => ref.current?.submit()}
      className="group p-2 bg-white border border-neutral-100  rounded-xl transition hover:border-blue-200 cursor-pointer h-[110px] md:p-4 md:h-[116px]"
    >
      <div className="grid grid-cols-[40px_1fr] gap-3">
        <div
          className={cn(
            'min-w-full w-full h-10 bg-orange-400 rounded-xl flex-shrink-0 flex justify-center items-center',
            getTemplateImageColor(item.template_name),
          )}
        >
          <img
            src={resolveTemplateImageUrl(item.template_name)}
            alt={`${item.name} icon`}
            className="text-foreground w-4"
          />
        </div>

        <div className="min-w-0">
          <h4 className="group-hover:text-blue-500 text-base font-bold mb-1 transition">
            {item.name}
          </h4>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={item.template_description}
          >
            {item.template_description}
          </p>

          <div className="relative overflow-y-auto mt-1">
            <WorkflowBlockList blocks={item.template_config.config.blocks} />

            <WorkflowBlockListOverflow className="bottom-0" />
          </div>
        </div>
      </div>

      <HiddenField name="template_name" value={item.template_name} />
    </ValidatedForm>
  );
}

export function DefaultTemplateItem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'group p-4 flex items-center justify-between gap-2 bg-white border border-neutral-100 h-[80px] rounded-xl transition hover:border-blue-200 cursor-pointer',
        className,
      )}
    >
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
    case 'spreadsheet_ai_assistant':
      return 'bg-yellow-500';
    case 'text_classification_assistant':
      return 'bg-purple-500';
    case 'text_feedback_assistant':
      return 'bg-teal-500';
    case 'seo_image_for_article':
      return 'bg-emerald-500';
    case 'blog_post_generator':
      return 'bg-rose-500';
    case 'search_and_scrape':
      return 'bg-cyan-500';
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
      className={cn('flex flex-col gap-4 md:gap-6 md:text-left', className)}
    >
      <h3 className="text-xl md:text-3xl font-medium">{heading}</h3>
      <p className="text-sm md:text-base text-muted-foreground">{subheading}</p>
    </header>
  );
}

export function resolveTemplateImageUrl(name: string) {
  return `/templates/${name}.svg`;
}
