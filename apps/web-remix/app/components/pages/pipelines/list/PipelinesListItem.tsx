import { Icon } from "@elpassion/taco";
import { IPipeline } from "../pipeline.types";
import React, { PropsWithChildren, useMemo } from "react";
import classNames from "classnames";
import { IconButton } from "~/components/iconButton";
import { confirm } from "~/components/modal/confirm";
import { useFetcher } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { ValidatedForm } from "remix-validated-form";
import { HiddenField } from "~/components/form/fields/field.context";
import { withZod } from "@remix-validated-form/with-zod";
import { CreatePipelineSchema } from "~/api/pipeline/pipeline.contracts";
import { Duplicate } from "~/icons/Duplicate";

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
        "group bg-neutral-800 px-6 py-4 rounded-lg text-basic-white hover:bg-neutral-850 transition cursor-pointer",
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
  const fetcher = useFetcher();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    confirm({
      onConfirm: async () =>
        fetcher.submit({ pipelineId: pipeline.id }, { method: "delete" }),
      confirmText: "Delete workflow",
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to delete the "{pipeline.name}” workflow from your
          organisation. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <header className="flex items-start">
      <h2 className="flex basis-1/2 text-lg font-medium">{pipeline.name}</h2>

      <div className="flex items-center basis-1/2 justify-between">
        <p className="text-sm">{pipeline.runs_count} runs</p>

        <div
          className="flex gap-1"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DuplicateForm pipeline={pipeline} />

          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Remove workflow"
            className="opacity-0 group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500"
            title={`Remove workflow: ${pipeline.name}`}
            icon={<Icon iconName="trash" />}
            onClick={handleDelete}
          />
        </div>
      </div>
    </header>
  );
};

interface DuplicateFormProps {
  pipeline: IPipeline;
}

function DuplicateForm({ pipeline }: DuplicateFormProps) {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);

  return (
    <ValidatedForm
      method="POST"
      validator={validator}
      action={routes.pipelinesNew(pipeline.organization_id)}
    >
      <HiddenField name="pipeline.name" value={pipeline.name + " copy"} />

      <HiddenField name="pipeline.config.version" value="1" />

      <HiddenField
        name="pipeline.config.blocks"
        value={JSON.stringify(pipeline.config.blocks)}
      />

      <IconButton
        size="xs"
        variant="ghost"
        aria-label="Duplicate workflow"
        className="opacity-0 group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-primary-500"
        title={`Duplicate workflow: ${pipeline.name}`}
        icon={<Duplicate className="w-3.5 h-3.5" />}
      />
    </ValidatedForm>
  );
}
