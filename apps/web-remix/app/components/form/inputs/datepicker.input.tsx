import React from "react";
import {
  Datepicker,
  DatepickerProps,
} from "~/components/datepicker/Datepicker";
import "./datepicker.styles.css";
import classNames from "classnames";

export type DatepickerInputProps = DatepickerProps;

export const DatepickerInputFallback = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        "w-full bg-neutral-800 rounded-lg h-[42px] border border-neutral-200",
        className
      )}
    />
  );
};

export const DatepickerInput: React.FC<DatepickerInputProps> = (props) => {
  return (
    <Datepicker
      fallback={<DatepickerInputFallback />}
      showPopperArrow={false}
      {...props}
    />
  );
};
