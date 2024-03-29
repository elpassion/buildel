import React, { PropsWithChildren, useEffect, useMemo } from "react";
import { ItemList } from "~/components/list/ItemList";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import z from "zod";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { HiddenField } from "~/components/form/fields/field.context";
import { BasicLink } from "~/components/link/BasicLink";
import {
  useFetcher,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  IPipeline,
  IPipelineAlias,
} from "~/components/pages/pipelines/pipeline.types";
import { routes } from "~/utils/routes.utils";
import { confirm } from "~/components/modal/confirm";
import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from "~/components/dropdown/Dropdown";
import { useDropdown } from "~/components/dropdown/DropdownContext";

interface AliasSelectProps {
  aliases: IPipelineAlias[];
  value?: string;
}

export const AliasSelect = ({ aliases, value }: AliasSelectProps) => {
  const name = useMemo(() => {
    return (
      aliases.find((alias) => alias.id.toString() === value?.toString())
        ?.name ?? "Latest"
    );
  }, [value, aliases]);

  return (
    <Dropdown placement="bottom-end">
      <AliasTrigger name={name} value={value} />

      <DropdownPopup className="min-w-[250px] absolute z-[11] top-full translate-y-[4px] right-0 bg-neutral-850 border border-neutral-800 rounded-lg overflow-hidden p-1 transition">
        <div className="overflow-y-auto max-h-[300px]">
          <AliasList data={aliases} />
        </div>
      </DropdownPopup>
    </Dropdown>
  );
};

function AliasTrigger({
  name,
  value,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isShown } = useDropdown();
  return (
    <DropdownTrigger
      aria-label="Select aliases"
      className="px-2 py-1 text-neutral-100 text-sm border border-neutral-800 rounded-lg transition bg-transparent hover:bg-neutral-900"
    >
      <div className="flex gap-1 items-center">
        <span>
          Aliases{" "}
          <span
            className={classNames({ "text-primary-500": value !== "latest" })}
          >
            ({name})
          </span>
        </span>
        <Icon iconName={isShown ? "chevron-up" : "chevron-down"} />
      </div>
    </DropdownTrigger>
  );
}

interface AliasListProps {
  data: IPipelineAlias[];
}

export const AliasList = ({ data }: AliasListProps) => {
  const [searchParams] = useSearchParams();
  const alias = searchParams.get("alias") ?? "latest";
  const location = useLocation();

  return (
    <ItemList
      items={data}
      className="flex flex-col gap-1"
      emptyText={<span className="text-neutral-200 text-xs">No data</span>}
      renderItem={(data) => (
        <BasicLink
          to={`${location.pathname}?alias=${data.id}`}
          state={{ reset: true }}
          className="focus:border"
          aria-label={`Select alias: ${data.name}`}
          data-testid="alias-link"
        >
          <AliasListItem data={data} isActive={alias === `${data.id}`} />
        </BasicLink>
      )}
    />
  );
};

interface AliasListItemProps {
  data: IPipelineAlias;
  isActive?: boolean;
}

export const AliasListItem = ({ data, isActive }: AliasListItemProps) => {
  const fetcher = useFetcher();

  const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();

    fetcher.submit(
      { id: data.id },
      { method: "DELETE", encType: "application/json" }
    );
  };

  return (
    <div
      className={classNames(
        "group flex justify-between items-center gap-2 text-neutral-100 text-sm py-2 px-1.5 rounded hover:pl-2 hover:bg-neutral-950 transition-all",
        { "bg-neutral-850": !isActive, "bg-neutral-950": isActive }
      )}
    >
      <div className="flex gap-2 items-center">
        <span className="truncate line-clamp-1">
          {isActive ? "*" : null} {data.name}
        </span>
        {data.id === "latest" ? (
          <AliasListItemBadge>{data.id}</AliasListItemBadge>
        ) : null}
      </div>

      {data.id !== "latest" && !isActive ? (
        <button
          onClick={onDelete}
          aria-label={`Delete alias: ${data.name}`}
          className="text-sm text-neutral-200 hover:text-primary-500 opacity-0 group-hover:opacity-100"
        >
          <Icon iconName="trash" />
        </button>
      ) : null}
    </div>
  );
};

function AliasListItemBadge({ children }: PropsWithChildren) {
  return (
    <div className="px-1 bg-neutral-800 text-neutral-300 text-xs !leading-[20px] rounded-sm">
      {children}
    </div>
  );
}

interface CreateAliasFormProps {
  pipeline: IPipeline;
  aliases: IPipelineAlias[];
}

export const CreateAliasForm = ({
  pipeline,
  aliases,
}: CreateAliasFormProps) => {
  const validator = useMemo(() => withZod(z.any()), []);
  const version = getLastAliasNumber(aliases.map((alias) => alias.name)) + 1;

  return (
    <ValidatedForm method="POST" validator={validator}>
      <HiddenField name="name" value={pipeline.name + ` v${version}`} />

      <HiddenField
        name="interface_config"
        value={JSON.stringify(pipeline.interface_config ?? {})}
      />

      <HiddenField name="config.version" value="1" />

      <HiddenField
        name="config.blocks"
        value={JSON.stringify(pipeline.config.blocks)}
      />

      <HiddenField
        name="config.connections"
        value={JSON.stringify(pipeline.config.connections)}
      />

      <button
        type="submit"
        data-testid="create-alias"
        className="bg-secondary-500 hover:bg-secondary-600 rounded-lg text-neutral-100 px-2 py-1 text-sm transition"
      >
        Create alias
      </button>
    </ValidatedForm>
  );
};

interface RestoreWorkflowProps {
  pipeline: IPipeline;
}

export const RestoreWorkflow = ({ pipeline }: RestoreWorkflowProps) => {
  const updateFetcher = useFetcher();
  const navigate = useNavigate();

  const onSubmit = () => {
    confirm({
      onConfirm: async () =>
        updateFetcher.submit(pipeline, {
          method: "PUT",
          encType: "application/json",
          action: routes.pipelineBuild(pipeline.organization_id, pipeline.id),
        }),
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to restore the workflow to previous version. This action
          is irreversible.
        </p>
      ),
    });
  };

  useEffect(() => {
    if (updateFetcher.data) {
      navigate(routes.pipelineBuild(pipeline.organization_id, pipeline.id));
    }
  }, [updateFetcher.data]);

  return (
    <button
      type="button"
      onClick={onSubmit}
      className="border border-neutral-800 rounded-lg text-neutral-100 px-2 py-1 text-sm transition bg-transparent hover:bg-neutral-900"
    >
      Restore
    </button>
  );
};

export function getLastAliasNumber(names: string[]) {
  const nrs = names
    .map((name) => name.split("v"))
    .map((part) => Number.parseInt(part[part.length - 1]))
    .filter((n) => !isNaN(n));

  return Math.max(...nrs, 0);
}
