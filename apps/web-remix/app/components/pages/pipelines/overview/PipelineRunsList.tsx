import React, { useMemo } from "react";
import classNames from "classnames";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { dayjs } from "~/utils/Dayjs";
import { IPipelineRun, IPipelineRuns } from "../pipeline.types";
import { Link, useSearchParams } from "@remix-run/react";
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
  const [searchParams] = useSearchParams();
  const reversed = useMemo(() => {
    return [...items].reverse();
  }, [items]);

  return (
    <ItemList
      aria-label="Runs list"
      className="flex flex-col-reverse gap-2"
      items={reversed}
      emptyText={<EmptyMessage>There is no runs yet...</EmptyMessage>}
      renderItem={(item, index) => (
        <Link
          to={routes.pipelineRun(
            organizationId,
            pipelineId,
            item.id,
            Object.fromEntries(searchParams.entries())
          )}
        >
          <PipelineRunsItem data={item} index={index} />
        </Link>
      )}
    />
  );
};

const LIST_LAYOUT_STYLES =
  "grid gap-1 grid-cols-[2fr_2fr_2fr_2fr_1fr] md:gap-2 md:grid-cols-[4fr_2fr_1fr_1fr_1fr]";

export const PipelineRunsListHeader = () => {
  return (
    <header
      className={classNames("text-white text-xs py-2 px-6", LIST_LAYOUT_STYLES)}
    >
      <p>Date</p>
      <p>Run costs ($)</p>
      <p>Input tokens</p>
      <p>Output tokens</p>
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

  const summaryInputTokens = data.costs.reduce(
    (acc, curr) => acc + Number(curr.data.input_tokens),
    0
  );

  const summaryOutputTokens = data.costs.reduce(
    (acc, curr) => acc + Number(curr.data.output_tokens),
    0
  );
  return (
    <article
      className={classNames(
        "group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 max-w-full items-center md:gap-2",
        LIST_LAYOUT_STYLES
      )}
    >
      <p className="text-white text-sm">
        {dayjs(data.created_at).format("DD MMM HH:mm")}
      </p>

      <p className="text-white text-sm">{summaryCosts}</p>

      <p className="text-white text-sm">{summaryInputTokens}</p>

      <p className="text-white text-sm">{summaryOutputTokens}</p>

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
