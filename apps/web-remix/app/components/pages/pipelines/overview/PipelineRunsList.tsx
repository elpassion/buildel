import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "@remix-run/react";
import { Indicator } from "@elpassion/taco";
import classNames from "classnames";
import { dayjs } from "~/utils/Dayjs";
import { routes } from "~/utils/routes.utils";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { IPipelineRun, IPipelineRuns } from "../pipeline.types";
import { StopRunForm } from "./StopRunForm";

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
      renderItem={(item) => (
        <Link
          to={routes.pipelineRun(
            organizationId,
            pipelineId,
            item.id,
            Object.fromEntries(searchParams.entries())
          )}
        >
          <PipelineRunsItem data={item} />
        </Link>
      )}
    />
  );
};

const LIST_LAYOUT_STYLES =
  "grid gap-1 grid-cols-[2fr_2fr_2fr_2fr_1fr_0.5fr] md:gap-2 md:grid-cols-[4fr_2fr_1fr_1fr_1fr_0.5fr]";

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
      <span />
    </header>
  );
};

interface PipelineRunsItemProps {
  data: IPipelineRun;
}

export const PipelineRunsItem: React.FC<PipelineRunsItemProps> = ({ data }) => {
  const [status, setStatus] = useState(data.status);

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

  const onStatusChange = (run: IPipelineRun) => {
    setStatus(run.status);
  };

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
          type={status !== "finished" ? "warning" : "success"}
          variant="badge"
          text={status}
        />
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        {status === "running" ? (
          <StopRunForm id={data.id} onStop={onStatusChange} />
        ) : null}
      </div>
    </article>
  );
};
