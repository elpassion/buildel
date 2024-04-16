import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { IconButton } from "~/components/iconButton";
import { HiddenField } from "~/components/form/fields/field.context";
import { StopRunSchema } from "~/components/pages/pipelines/overview/schema";

interface StopRunFormProps {
  id: number;
}

export const StopRunForm: React.FC<StopRunFormProps> = ({ id }) => {
  const validator = useMemo(() => withZod(StopRunSchema), []);

  return (
    <ValidatedForm method="POST" validator={validator}>
      <HiddenField name="runId" value={id} />

      <IconButton
        aria-label="Stop run"
        iconName="stop-circle"
        size="xs"
        onlyIcon
      />
    </ValidatedForm>
  );
};
