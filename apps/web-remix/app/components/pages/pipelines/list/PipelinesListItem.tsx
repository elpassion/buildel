import { Icon } from "@elpassion/taco";
import { IPipeline } from "./pipelines.types";
import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import { IconButton } from "~/components/iconButton";
import { confirm } from "~/components/modal/confirm";
import { useFetcher } from "@remix-run/react";

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
    </header>
  );
};
