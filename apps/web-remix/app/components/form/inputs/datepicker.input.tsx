import React from "react";
import type {
  DatepickerProps} from "~/components/datepicker/Datepicker";
import {
  Datepicker
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
        "w-full bg-neutral-800 rounded-lg h-[42px] border border-neutral-200 relative",
        className
      )}
    >
      <div className="w-[80%] h-[60%] bg-neutral-850 rounded absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-pulse" />
    </div>
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
