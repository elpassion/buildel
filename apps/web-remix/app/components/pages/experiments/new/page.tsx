import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useMatch, useNavigate } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateExperimentSchema } from '~/api/experiments/experiments.contracts';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SelectField } from '~/components/form/fields/select.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function NewExperiment() {
  const { organizationId, pipelines, datasets } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const match = useMatch(routes.experimentsNew(organizationId));
  const isModalOpen = !!match;

  const closeModal = () => {
    navigate(routes.experiments(organizationId));
  };

  const validator = useMemo(() => withZod(CreateExperimentSchema), []);

  const pipelinesOptions = useMemo(() => {
    return pipelines.map(toSelectOption);
  }, []);

  const datasetsOptions = useMemo(() => {
    return datasets.map(toSelectOption);
  }, []);

  return (
    <DialogDrawer open={isModalOpen} onOpenChange={closeModal}>
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>New Experiment</DialogDrawerTitle>
        </DialogDrawerHeader>

        <DialogDrawerBody>
          <div className="py-1">
            <ValidatedForm
              noValidate
              method="POST"
              id="new-experiment-form"
              validator={validator}
              className="space-y-4"
            >
              <div>
                <Field name="name">
                  <FieldLabel>Name</FieldLabel>
                  <TextInputField />
                  <FieldMessage>Enter the name of the experiment</FieldMessage>
                </Field>
              </div>

              <Field name="dataset_id">
                <SelectField
                  label="Dataset"
                  supportingText="Select the dataset you want to use for the experiment"
                  options={datasetsOptions}
                  getPopupContainer={(node) => node.parentNode.parentNode}
                />
              </Field>

              <Field name="pipeline_id">
                <SelectField
                  label="Pipeline"
                  supportingText="Select the pipeline you want to use for the experiment"
                  options={pipelinesOptions}
                  getPopupContainer={(node) => node.parentNode.parentNode}
                />
              </Field>
            </ValidatedForm>
          </div>
        </DialogDrawerBody>

        <DialogDrawerFooter>
          <Button variant="outline" size="sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" size="sm" form="new-experiment-form">
            Create
          </Button>
        </DialogDrawerFooter>
      </DialogDrawerContent>
    </DialogDrawer>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Experiment',
    },
  ];
});
