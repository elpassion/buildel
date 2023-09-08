import React, { forwardRef, LabelHTMLAttributes } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";

export const FieldLabel = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ children, ...props }, ref) => {
  const { name } = useFieldContext();
  return (
    <label className="label" ref={ref} htmlFor={name} {...props}>
      <span className="label-text">{children}</span>
    </label>
  );
});
