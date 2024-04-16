import React from "react";
import { DatepickerInput } from "~/components/form/inputs/datepicker.input";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { loader } from "./loader.server";
import { routes } from "~/utils/routes.utils";
import { dayjs } from "~/utils/Dayjs";

export const MonthPicker = () => {
  const navigate = useNavigate();
  const { startDate, organizationId, pipelineId } =
    useLoaderData<typeof loader>();

  const handleSetDate = (date: Date | null) => {
    navigate(
      routes.pipelineRuns(organizationId, pipelineId, {
        start_date: dayjs(date).startOfMonth.toISOString(),
        end_date: dayjs(date).endOfMonth.toISOString(),
      })
    );
  };

  return (
    <DatepickerInput
      selected={new Date(startDate)}
      onChange={handleSetDate}
      showMonthYearPicker
      dateFormat="MMMM"
    />
  );
};
