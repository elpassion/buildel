import React, { useCallback, useEffect, useMemo } from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { useFetcher } from "@remix-run/react";
import { Field } from "~/components/form/fields/field.context";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { successToast } from "~/components/toasts/successToast";
import { SubmitButton } from "~/components/form/submit";
import { routes } from "~/utils/routes.utils";
import { BudgetLimitField } from "./BudgetLimitField";
import { updatePipelineBudgetLimitSchema } from "./schema";

interface EditPipelineLimitFormProps {
  defaultValues: IPipeline;
}
export function EditPipelineLimitForm({
  defaultValues,
}: EditPipelineLimitFormProps) {
  const validator = useMemo(() => withZod(updatePipelineBudgetLimitSchema), []);

  const updateFetcher = useFetcher<IPipeline>();
  const handleOnSubmit = useCallback(
    (
      data: { budget_limit?: number | null },
      e: React.FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();
      const pipeline = {
        ...defaultValues,
        budget_limit: data.budget_limit ?? null,
      };

      updateFetcher.submit(pipeline, {
        method: "PUT",
        encType: "application/json",
        action:
          routes.pipelineBuild(pipeline.organization_id, pipeline.id) +
          "?index",
      });
    },
    [defaultValues]
  );

  useEffect(() => {
    if (updateFetcher.data) {
      successToast({ description: "Workflow name has been changed" });
    }
  }, [updateFetcher]);

  return (
    <ValidatedForm
      method="put"
      noValidate
      validator={validator}
      onSubmit={handleOnSubmit}
      defaultValues={{ budget_limit: defaultValues.budget_limit }}
    >
      <Field name="budget_limit">
        <BudgetLimitField
          label="Limit"
          supportingText="The limit setting in a pipeline refers to a financial limit ($) imposed on the operations within the pipeline."
        />
      </Field>

      <SubmitButton type="submit" size="sm" className="mt-4 ml-auto mr-0">
        Save
      </SubmitButton>
    </ValidatedForm>
  );
}
