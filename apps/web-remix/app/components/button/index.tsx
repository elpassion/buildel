import React from "react";
import {
  Button as TacoButton,
  ButtonProps as TacoButtonProps,
} from "@elpassion/taco";
export const Button: React.FC<TacoButtonProps> = (props) => {
  return <TacoButton {...props} />;
};
