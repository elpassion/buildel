import { useNavigation } from '@remix-run/react';
import type { ButtonProps } from '@elpassion/taco';
import { Button } from '@elpassion/taco';
import { useFormContext } from 'remix-validated-form';

export function SubmitButton(props: ButtonProps) {
  const { isSubmitting } = useFormContext();
  const { state } = useNavigation();

  const disabled = props.disabled || isSubmitting || state !== 'idle';
  const isLoading = props.isLoading || isSubmitting || state !== 'idle';

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled}
      isLoading={isLoading}
    />
  );
}
