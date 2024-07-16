import React from "react";
import { useNavigate } from "@remix-run/react";
import { Icon } from "@elpassion/taco";
import {
  DatepickerInput,
  DatepickerInputFallback,
} from "~/components/form/inputs/datepicker.input";
import { PaginationButton } from "~/components/pagination/Pagination";
import { dayjs } from "~/utils/Dayjs";
import { buildUrlWithParams } from "~/utils/url";
import "./monthPicker.styles.css";

interface MonthPickerProps {
  date: Date;
  loaderUrl: string;
}

export const MonthPicker = ({ date, loaderUrl }: MonthPickerProps) => {
  const navigate = useNavigate();

  const onDateChange = (date: Date | null) => {
    const urlWithParams = buildUrlWithParams(loaderUrl, {
      start_date: dayjs(date).startOfMonth.toISOString(),
      end_date: dayjs(date).endOfMonth.toISOString(),
    });

    navigate(urlWithParams);
  };

  const nextMonth = () => {
    const d = dayjs(date).addMonth(1);

    const urlWithParams = buildUrlWithParams(loaderUrl, {
      start_date: dayjs(d).startOfMonth.toISOString(),
      end_date: dayjs(d).endOfMonth.toISOString(),
    });

    navigate(urlWithParams);
  };

  const prevMonth = () => {
    const d = dayjs(date).subtractMonth(1);

    const urlWithParams = buildUrlWithParams(loaderUrl, {
      start_date: dayjs(d).startOfMonth.toISOString(),
      end_date: dayjs(d).endOfMonth.toISOString(),
    });

    navigate(urlWithParams);
  };

  return (
    <div className="flex gap-1 items-center">
      <PaginationButton onClick={prevMonth}>
        <Icon iconName="chevron-left" />
      </PaginationButton>

      <DatepickerInput
        selected={new Date(date)}
        onChange={onDateChange}
        showMonthYearPicker
        dateFormat="MMMM"
        className="h-[30px]"
        fallback={
          <DatepickerInputFallback className="!h-[30px] !bg-transparent !border-neutral-800" />
        }
      />

      <PaginationButton onClick={nextMonth}>
        <Icon iconName="chevron-right" />
      </PaginationButton>
    </div>
  );
};
