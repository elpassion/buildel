import React from "react";
import type { TextareaProps } from "@elpassion/taco";
import { Textarea } from "@elpassion/taco";

export type TextareaInputProps = TextareaProps;
export const TextareaInput: React.FC<TextareaInputProps> = ({
  className,
  style,
  ...props
}) => {
  //className do not work right now
  return (
    <Textarea
      {...props}
      style={{
        fontSize: "12px",
        lineHeight: "16px",
        backgroundColor: "#454545",
        color: "white",
        padding: "8px 10px",
        resize: "none",
        ...style,
      }}
    />
  );
};
