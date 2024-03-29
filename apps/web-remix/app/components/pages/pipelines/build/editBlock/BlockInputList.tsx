import React, { PropsWithChildren, useMemo, useRef, useState } from "react";
import { ItemList } from "~/components/list/ItemList";
import { HelpfulIcon } from "~/components/tooltip/HelpfulIcon";
import { IConfigConnection } from "~/components/pages/pipelines/pipeline.types";
import { Checkbox } from "@elpassion/taco";
import classNames from "classnames";
import { useInputs } from "./EditBlockForm";

interface BlockInputListProps {
  connections: IConfigConnection[];
}

export const BlockInputList: React.FC<BlockInputListProps> = ({
  connections,
}) => {
  const formattedConnections: IItem[] = useMemo(
    () =>
      connections.map((connection) => {
        const id = `${connection.from.block_name}:${connection.from.output_name}-${connection.to.block_name}:${connection.to.input_name}`;
        return {
          id: id,
          data: connection,
        };
      }),
    [connections]
  );

  if (formattedConnections.length === 0) return null;

  return (
    <div>
      <div className="flex gap-2 items-center mb-2">
        <h4 className="font-medium text-white text-xs">Inputs</h4>
        <HelpfulIcon
          id={`inputs-helpful-icon`}
          text="Check if the input must be resubmitted for each workflow execution."
          size="sm"
          place="top"
        />
      </div>

      <ItemList
        className="flex flex-wrap gap-2"
        items={formattedConnections}
        renderItem={(item) => <BlockInputItem {...item} />}
      />
    </div>
  );
};

interface IItem {
  id: string;
  data: IConfigConnection;
}

function BlockInputItem({ data }: IItem) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [resettable, setResettable] = useState(data.opts.reset);
  const { updateInputReset } = useInputs();

  const onCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInputReset(data, e.target.checked);
    setResettable(e.target.checked);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Badge className="cursor-pointer">
        <Checkbox
          size="sm"
          checked={resettable}
          onChange={onCheckedChange}
          id={`${data.from.block_name}-resettable`}
        />

        <label
          htmlFor={`${data.from.block_name}-resettable`}
          className="cursor-pointer"
        >
          <BadgeText variant={resettable ? "primary" : "secondary"}>
            {data.from.block_name}
          </BadgeText>
        </label>
      </Badge>
    </div>
  );
}

interface BadgeProps {
  className?: string;
  onClick?: () => void;
}

function Badge({
  children,
  className,
  onClick,
}: PropsWithChildren<BadgeProps>) {
  return (
    <div
      onClick={onClick}
      className={classNames(
        "bg-neutral-800 px-2 py-1 rounded-md flex items-center",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BadgeTextProps {
  variant?: "primary" | "secondary";
}

function BadgeText({
  variant = "primary",
  children,
}: PropsWithChildren<BadgeTextProps>) {
  return (
    <p
      className={classNames("text-xs", {
        "text-primary-500": variant === "primary",
        "text-secondary-500": variant === "secondary",
      })}
    >
      {children}
    </p>
  );
}
