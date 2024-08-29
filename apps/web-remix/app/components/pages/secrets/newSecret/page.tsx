import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateSecretSchema } from '~/api/secrets/secrets.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import {
  PasswordInputField,
  TextInputField,
} from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { metaWithDefaults } from '~/utils/metadata';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import { useLoaderData } from '@remix-run/react';
import { loader } from './loader.server';
import { AsyncSelectField } from '~/components/form/fields/asyncSelect.field';

export function NewSecret() {
  const { aliases, organizationId } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(CreateSecretSchema), []);


  return (
    <ValidatedForm
      noValidate
      validator={validator}
      method="post"
      className="grow flex flex-col gap-2"
    >
      <div className="w-full space-y-6">
        <div>
          <Field name="name">
            <FieldLabel>Name your Secret</FieldLabel>
            <TextInputField
              autoFocus
              placeholder="e.g. my open ai key"
              type="text"
            />
            <FieldMessage>
              It will help you identify the key in BUILDEL
            </FieldMessage>
          </Field>
        </div>

        <div>
          <Field name="value">
            <FieldLabel>Enter the Secret key</FieldLabel>
            <PasswordInputField placeholder="Type or paste in your token key" />
            <FieldMessage>
              The actual token key that will authorise you in the external
              system, such as Open AI.
            </FieldMessage>
          </Field>
        </div>

        <div>
          <Field name="alias">
            <AsyncSelectField
              url={`/api/organizations/${organizationId}/secrets/aliases`}
              label="Default for:"
              id="alias"
              supportingText="The default provider for this secret"
            />
          </Field>
        </div>
      </div>

      <SubmitButton size="sm">Save the Secret</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Secret',
    },
  ];
});
