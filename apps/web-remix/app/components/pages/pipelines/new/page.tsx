import React, { useMemo, useRef, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import startCase from 'lodash.startcase';
import { ValidatedForm } from 'remix-validated-form';

import type { IWorkflowTemplate } from '~/api/organization/organization.contracts';
import { CreateFromTemplateSchema } from '~/api/organization/organization.contracts';
import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
import {
  getTemplateImageColor,
  resolveTemplateImageUrl,
} from '~/components/pages/pipelines/list/WorkflowTemplates';
import type { loader } from '~/components/pages/pipelines/new/loader.server';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { RadioGroup, RadioTabGroupItem } from '~/components/ui/radio-group';
import { cn } from '~/utils/cn';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

export function NewPipelinePage() {
  const { step, organizationId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(`${organizationId}/pipelines/new`);
  const isSidebarOpen = !!match;

  const handleCloseSidebar = (value: boolean) => {
    if (value) return;
    navigate(routes.pipelines(organizationId));
  };

  const isFormStep = step === 'form';

  return (
    <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
      <DialogDrawerContent
        className={cn({ 'md:w-[90%] max-w-[900px]': !isFormStep })}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Create a new workflow</DialogDrawerTitle>
          <DialogDrawerDescription>
            Any workflow can contain many Blocks and use your Knowledge Base.
          </DialogDrawerDescription>
        </DialogDrawerHeader>

        <DialogDrawerBody>
          {isFormStep ? (
            <NameFormStep />
          ) : (
            <div className="min-h-[350px] md:min-h-[574px]">
              <TemplatesStep />
            </div>
          )}
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Pipeline',
    },
  ];
});

function NameFormStep() {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="pipeline.name">
          <FieldLabel>Name</FieldLabel>
          <TextInputField
            type="text"
            autoFocus
            placeholder="eg. Text To Speech"
            aria-label="Name"
          />
          <FieldMessage>
            It will help you identify the workflow in BUILDEL
          </FieldMessage>
        </Field>

        <HiddenField name="pipeline.config.version" value="1" />

        <HiddenField name="pipeline.config.connections" value="[]" />

        <HiddenField name="pipeline.config.blocks" value={'[]'} />
      </div>

      <SubmitButton size="sm">Create workflow</SubmitButton>
    </ValidatedForm>
  );
}

function TemplatesStep() {
  const { templates, organizationId } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between gap-2 items-center mb-2">
        <h4 className="text-muted-foreground font-medium text-sm">Templates</h4>

        <Button asChild size="xxs" variant="ghost">
          <BasicLink to={routes.pipelinesNew(organizationId) + '?step=form'}>
            Empty project
          </BasicLink>
        </Button>
      </div>

      <TemplateTabs templates={templates}>
        {({ templates: filtered }) => (
          <TemplateList
            items={filtered}
            action={`/${organizationId}/pipelines`}
          />
        )}
      </TemplateTabs>
    </>
  );
}

interface TemplateTabsProps {
  templates: IWorkflowTemplate[];
  children: ({
    templates,
  }: {
    templates: IWorkflowTemplate[];
  }) => React.ReactNode;
}

function TemplateTabs({ templates, children }: TemplateTabsProps) {
  const [selectedGroup, setSelectedGroup] = useState('all');

  const grupedBy = useMemo(() => {
    return templates.reduce(
      (acc, template) => {
        template.groups.forEach((group) => {
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(template);
        });
        return acc;
      },
      {} as Record<string, IWorkflowTemplate[]>,
    );
  }, [templates]);

  const groups = useMemo(() => {
    return ['all', ...Object.keys(grupedBy)].map((group) => ({
      label: startCase(group),
      value: group,
    }));
  }, [grupedBy]);

  const filteredTemplates = useMemo(() => {
    return selectedGroup === 'all'
      ? templates
      : (grupedBy[selectedGroup] ?? []);
  }, [grupedBy, selectedGroup]);

  return (
    <div className="flex flex-col gap-5 w-full md:flex-row">
      <RadioGroup
        value={selectedGroup}
        onValueChange={setSelectedGroup}
        className="flex gap-1 overflow-x-auto md:flex-col md:overflow-x-visible"
      >
        {groups.map((group) => (
          <RadioTabGroupItem
            key={group.value}
            value={group.value}
            id={group.value}
            className="data-[state=checked]:bg-secondary h-fit grow-0 capitalize shrink-0 whitespace-nowrap min-w-[80px] md:justify-start md:text-left"
          >
            {group.label}
          </RadioTabGroupItem>
        ))}
      </RadioGroup>

      <div className="w-full">{children({ templates: filteredTemplates })}</div>
    </div>
  );
}

interface TemplateListProps {
  items: IWorkflowTemplate[];
  action?: string;
  children?: React.ReactNode;
}
export function TemplateList({ items, action, children }: TemplateListProps) {
  const formattedTemplates = useMemo(
    () => items.map((template) => ({ ...template, id: template.name })),
    [items],
  );
  return (
    <ItemList
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      items={formattedTemplates}
      renderItem={(item) => <TemplateListItem action={action} item={item} />}
    >
      {children}
    </ItemList>
  );
}

interface ITemplateItem {
  item: IWorkflowTemplate;
  action?: string;
}
function TemplateListItem({ item, action }: ITemplateItem) {
  const ref = useRef<HTMLFormElement>(null);
  const validator = useMemo(() => withZod(CreateFromTemplateSchema), []);
  return (
    <ValidatedForm
      formRef={ref}
      action={action}
      method="POST"
      validator={validator}
      onClick={() => ref.current?.submit()}
      className="group p-2 bg-white border border-neutral-100 min-h-[90px] rounded-xl transition hover:border-blue-200 cursor-pointer md:p-3 md:min-h-[98px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div
            className={cn(
              'min-w-8 w-8 h-8 bg-orange-400 rounded-lg shrink-0 flex justify-center items-center',
              getTemplateImageColor(item.template_name),
            )}
          >
            <img
              src={resolveTemplateImageUrl(item.template_name)}
              alt={`${item.name} icon`}
              className="text-foreground w-4"
            />
          </div>

          <h4 className="group-hover:text-blue-500 text-base font-bold transition">
            {item.name}
          </h4>
        </div>

        <div className="grow">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.template_description}
          </p>
        </div>
      </div>

      <HiddenField name="template_name" value={item.template_name} />
    </ValidatedForm>
  );
}
