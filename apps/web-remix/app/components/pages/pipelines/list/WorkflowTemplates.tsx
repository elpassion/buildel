import React, { PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";
import { ItemList } from "~/components/list/ItemList";
import { Button, Icon } from "@elpassion/taco";
import { Link } from "@remix-run/react";
import { INode } from "../pipeline.types";
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
        "flex-grow bg-neutral-800 p-4 text-white rounded-lg",
        className
      )}
    >
      {children}
    </article>
  );
};

interface ITemplate {
  id: string | number;
  to: string;
  name: string;
  blocks: Partial<INode>[];
  icon?: ReactNode;
}

interface WorkflowTemplatesListProps {
  items: ITemplate[];
}
export function WorkflowTemplatesList({ items }: WorkflowTemplatesListProps) {
  return (
    <ItemList
      className="flex flex-col gap-2"
      items={items}
      renderItem={(item) => <WorkflowTemplatesListItem {...item} />}
    />
  );
}
function WorkflowTemplatesListItem({ icon, name, to, blocks }: ITemplate) {
  const combineUrl = () => {
    return `${to}?blocks=${encodeURIComponent(JSON.stringify(blocks))}`;
  };

  return (
    <Link
      to={combineUrl()}
      className="group p-4 flex items-center justify-between gap-2 bg-neutral-900 hover:bg-neutral-950 rounded-lg text-white h-[60px] transition"
    >
      <div className="flex items-center gap-3">
        {icon ? icon : null}
        <h4 className="text-sm font-medium">{name}</h4>
      </div>

      <Button tabIndex={0} size="xs" className="hidden group-hover:block">
        <div className="flex gap-1 items-center">
          <span className="text-xs">Build</span>
          <Icon iconName="arrow-right" className="text-sm" />
        </div>
      </Button>
    </Link>
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
