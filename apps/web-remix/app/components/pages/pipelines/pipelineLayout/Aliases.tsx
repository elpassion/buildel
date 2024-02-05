import React, { HTMLProps, PropsWithChildren, useMemo, useRef } from "react";
import { ItemList } from "~/components/list/ItemList";
import {
  IPipeline,
  IPipelineAlias,
  IPipelineConfig,
} from "~/components/pages/pipelines/pipeline.types";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";
import { Badge, Icon } from "@elpassion/taco";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "~/components/pages/pipelines/list/schema";
import { routes } from "~/utils/routes.utils";
import { HiddenField } from "~/components/form/fields/field.context";
import { IconButton } from "~/components/iconButton";
import { Duplicate } from "~/icons/Duplicate";
import { createAliasSchema } from "./schema";
import z from "zod";
import { BasicLink } from "~/components/link/BasicLink";

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
        "px-2 py-1 text-neutral-100 text-sm border border-neutral-800 rounded-lg",
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
        "min-w-[250px] absolute z-[11] top-full translate-y-[4px] right-0 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden p-1 transition",
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
  return (
    <ItemList
      items={data}
      emptyText={<span className="text-neutral-200 text-xs">No data</span>}
      renderItem={(data) => (
        <BasicLink to={`?alias=${data.id}`}>
          <AliasListItem data={data} />
        </BasicLink>
      )}
    />
  );
};

interface AliasListItemProps {
  data: IPipelineAlias;
}

export const AliasListItem = ({ data }: AliasListItemProps) => {
  return (
    <div className="flex gap-2 text-neutral-100 text-sm py-2 px-1 rounded hover:px-2 hover:bg-neutral-950 transition-all">
      <span>{data.name}</span>
      {data.id === "latest" ? (
        <div className="px-1 bg-neutral-800 text-neutral-300 text-xs !leading-[20px] rounded-sm">
          {data.id}
        </div>
      ) : null}
    </div>
  );
};

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

      <button type="submit" aria-label="Create workflow alias">
        Create alias
      </button>
    </ValidatedForm>
  );
};
