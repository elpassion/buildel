import React from "react";
import {
  Datepicker,
  DatepickerProps,
} from "~/components/datepicker/Datepicker";
import "./datepicker.styles.css";

export type DatepickerInputProps = Omit<DatepickerProps, "fallback">;

export const DatepickerInput: React.FC<DatepickerInputProps> = (props) => {
  return (
    <Datepicker
      fallback={
        <div className="w-full bg-neutral-800 rounded-lg h-[42px] border border-neutral-200" />
      }
      showPopperArrow={false}
      {...props}
    />
  );
};
