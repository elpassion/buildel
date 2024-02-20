import React from "react";
import { Textarea, TextareaProps } from "@elpassion/taco";

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
