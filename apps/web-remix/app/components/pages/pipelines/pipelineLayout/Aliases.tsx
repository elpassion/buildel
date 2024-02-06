import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { ItemList } from "~/components/list/ItemList";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import z from "zod";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { HiddenField } from "~/components/form/fields/field.context";
import { BasicLink } from "~/components/link/BasicLink";
import { useFetcher, useNavigate, useSearchParams } from "@remix-run/react";
import {
  IPipeline,
  IPipelineAlias,
} from "~/components/pages/pipelines/pipeline.types";
import { routes } from "~/utils/routes.utils";

interface AliasSelectProps {
  aliases: IPipelineAlias[];
}

export const AliasSelect = ({ aliases }: AliasSelectProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { value, setTrue, setFalse } = useBoolean(false);

  const show = () => {
    setTrue();
  };

  const hide = () => {
    setFalse();
  };

  useOnClickOutside(wrapperRef, hide);

  return (
    <div ref={wrapperRef} className="relative">
      <SelectTrigger onClick={show}>
        <div className="flex gap-1 items-center">
          <span>Aliases</span>
          <Icon iconName={value ? "chevron-up" : "chevron-down"} />
        </div>
      </SelectTrigger>

      <AliasDropdown isShown={value}>
        <AliasList data={aliases} />
      </AliasDropdown>
    </div>
  );
};

function SelectTrigger({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={classNames(
        "px-2 py-1 text-neutral-100 text-sm border border-neutral-800 rounded-lg transition bg-transparent hover:bg-neutral-900",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface AliasDropdownProps {
  isShown: boolean;
}

export const AliasDropdown: React.FC<PropsWithChildren<AliasDropdownProps>> = ({
  children,
  isShown,
}) => {
  return (
    <div
      className={classNames(
        "min-w-[250px] absolute z-[11] top-full translate-y-[4px] right-0 bg-neutral-850 border border-neutral-800 rounded-lg overflow-hidden p-1 transition",
        {
          "opacity-0 pointer-events-none": !isShown,
          "opacity-100 pointer-events-auto": isShown,
        }
      )}
    >
      <div className="overflow-y-auto max-h-[300px]">{children}</div>
    </div>
  );
};

interface AliasListProps {
  data: IPipelineAlias[];
}

export const AliasList = ({ data }: AliasListProps) => {
  const [searchParams] = useSearchParams();
  const alias = searchParams.get("alias") ?? "latest";

  return (
    <ItemList
      items={data}
      className="flex flex-col gap-1"
      emptyText={<span className="text-neutral-200 text-xs">No data</span>}
      renderItem={(data) => (
        <BasicLink to={data.id === "latest" ? "" : `?alias=${data.id}`}>
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
          aria-label="Delete alias"
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
}

export const CreateAliasForm = ({ pipeline }: CreateAliasFormProps) => {
  const validator = useMemo(() => withZod(z.any()), []);

  return (
    <ValidatedForm method="POST" validator={validator}>
      <HiddenField
        name="name"
        value={pipeline.name + ` ${Math.random().toFixed(2)}`}
      />

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
        aria-label="Create workflow alias"
        className="bg-secondary-500 hover:bg-secondary-600 rounded-lg text-neutral-100 px-2 py-1 text-sm transition"
      >
        Create alias
      </button>
    </ValidatedForm>
  );
};

interface RestoreWorkflowProps {
  pipeline: IPipeline;

  aliasId: string;
}

export const RestoreWorkflow = ({
  pipeline,
  aliasId,
}: RestoreWorkflowProps) => {
  const updateFetcher = useFetcher();
  const navigate = useNavigate();

  const onSubmit = () => {
    updateFetcher.submit(pipeline, {
      method: "PUT",
      encType: "application/json",
      action: routes.pipelineBuild(pipeline.organization_id, pipeline.id),
    });
  };

  useEffect(() => {
    if (updateFetcher.data) {
      navigate(routes.pipelineBuild(pipeline.organization_id, pipeline.id));
    }
  }, [updateFetcher.data]);

  if (aliasId === "latest") return null;

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
