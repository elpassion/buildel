import React, { useEffect, useMemo } from "react";
import { action } from "./action.server";
import { useActionData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { IconButton } from "~/components/iconButton";
import { HiddenField } from "~/components/form/fields/field.context";
import { StopRunSchema } from "~/components/pages/pipelines/overview/schema";
import { IPipelineRun } from "~/components/pages/pipelines/pipeline.types";

interface StopRunFormProps {
  id: number;
  onStop: (data: IPipelineRun) => void;
}

export const StopRunForm: React.FC<StopRunFormProps> = ({ id, onStop }) => {
  const updated = useActionData<typeof action>();
  const validator = useMemo(() => withZod(StopRunSchema), []);

  useEffect(() => {
    // @ts-ignore
    if (updated?.run) {
      // @ts-ignore
      onStop(updated.run);
    }
  }, [updated]);

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
