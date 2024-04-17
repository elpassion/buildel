import React from "react";
import {
  DatepickerInput,
  DatepickerInputFallback,
} from "~/components/form/inputs/datepicker.input";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { loader } from "./loader.server";
import { routes } from "~/utils/routes.utils";
import { dayjs } from "~/utils/Dayjs";
import "./monthPicker.styles.css";
import { PaginationButton } from "~/components/pagination/Pagination";
import { Icon } from "@elpassion/taco";

export const MonthPicker = () => {
  const navigate = useNavigate();
  const { startDate, organizationId, pipelineId } =
    useLoaderData<typeof loader>();

  const onDateChange = (date: Date | null) => {
    navigate(
      routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(date).startOfMonth.toISOString(),
        end_date: dayjs(date).endOfMonth.toISOString(),
      })
    );
  };

  const nextMonth = () => {
    const date = dayjs(startDate).add(1, "month");

    navigate(
      routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(date).startOfMonth.toISOString(),
        end_date: dayjs(date).endOfMonth.toISOString(),
      })
    );
  };

  const prevMonth = () => {
    const date = dayjs(startDate).subtract(1, "month");

    navigate(
      routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(date).startOfMonth.toISOString(),
        end_date: dayjs(date).endOfMonth.toISOString(),
      })
    );
  };

  return (
    <div className="flex gap-1 items-center">
      <PaginationButton onClick={prevMonth}>
        <Icon iconName="chevron-left" />
      </PaginationButton>

      <DatepickerInput
        selected={new Date(startDate)}
        onChange={onDateChange}
        showMonthYearPicker
        dateFormat="MMMM"
        className="h-[30px]"
        fallback={
          <DatepickerInputFallback className="!h-[30px] !bg-transparent !border-neutral-800 !rounded" />
        }
      />

      <PaginationButton onClick={nextMonth}>
        <Icon iconName="chevron-right" />
      </PaginationButton>
    </div>
  );
};
