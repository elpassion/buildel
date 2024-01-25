import React, { useMemo } from "react";
import classNames from "classnames";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { dayjs } from "~/utils/Dayjs";
import { IPipelineRun, IPipelineRuns } from "../pipeline.types";
import { Link } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { Indicator } from "@elpassion/taco";

interface PipelineRunsListProps {
  items: IPipelineRuns;
  pipelineId: string;
  organizationId: string;
}

export const PipelineRunsList: React.FC<PipelineRunsListProps> = ({
  items,
  pipelineId,
  organizationId,
}) => {
  const reversed = useMemo(() => {
    return [...items].reverse();
  }, [items]);

  return (
    <ItemList
      className="flex flex-col-reverse gap-2"
      items={reversed}
      emptyText={<EmptyMessage>There is no runs yet...</EmptyMessage>}
      renderItem={(item, index) => (
        <Link to={routes.pipelineRun(organizationId, pipelineId, item.id)}>
          <PipelineRunsItem data={item} index={index} />
        </Link>
      )}
    />
  );
};

const LIST_LAYOUT_STYLES =
  "grid gap-1 grid-cols-[2fr_2fr_1fr_1fr] md:gap-2 md:grid-cols-[3fr_2fr_1fr_1fr]";

export const PipelineRunsListHeader = () => {
  return (
    <header
      className={classNames("text-white text-xs py-2 px-6", LIST_LAYOUT_STYLES)}
    >
      <p>Run</p>
      <p>Time</p>
      <p>Run costs ($)</p>
      <p>Status</p>
    </header>
  );
};

interface PipelineRunsItemProps {
  data: IPipelineRun;
  index: number;
}

export const PipelineRunsItem: React.FC<PipelineRunsItemProps> = ({
  data,
  index,
}) => {
  const summaryCosts = data.costs
    .reduce((acc, curr) => acc + Number(curr.data.amount), 0)
    .toFixed(10);

  return (
    <article
      className={classNames(
        "group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 max-w-full items-center md:gap-2",
        LIST_LAYOUT_STYLES
      )}
    >
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          Run: {index + 1}
        </h3>
      </header>

      <p className="text-white text-sm">
        {dayjs(data.created_at).format("DD MMM HH:mm")}
      </p>

      <p className="text-white text-sm">{summaryCosts}</p>

      <div className="w-fit">
        <Indicator
          type={data.status !== "finished" ? "warning" : "success"}
          variant="badge"
          text={data.status}
        />
      </div>
    </article>
  );
};
