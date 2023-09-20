import React from "react";
import { Textarea, TextareaProps } from "@elpassion/taco";

export type TextareaInputProps = TextareaProps;
export const TextareaInput: React.FC<TextareaInputProps> = ({
  className,
  ...props
}) => {
  //className do not work right now
  return <Textarea {...props} />;
};
