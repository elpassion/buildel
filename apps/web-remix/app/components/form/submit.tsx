import { useNavigation } from "@remix-run/react";
import { useFormContext } from "remix-validated-form";
import type { ButtonProps } from "@elpassion/taco";
import { Button } from "@elpassion/taco";

export function SubmitButton(props: ButtonProps) {
  const { isSubmitting } = useFormContext();
  const { state } = useNavigation();

  const disabled = props.disabled || isSubmitting || state !== "idle";
  const isLoading = props.isLoading || isSubmitting || state !== "idle";

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled}
      isLoading={isLoading}
    />
  );
}
