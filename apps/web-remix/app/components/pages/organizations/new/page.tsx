import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateOrganizationSchema } from '~/api/organization/organization.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { metaWithDefaults } from '~/utils/metadata';

export function NewOrganizationPage() {
  const validator = useMemo(() => withZod(CreateOrganizationSchema), []);

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-2">
      <div className="w-full max-w-lg rounded-lg text-center">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-bold  ">Name your organisation</h1>
          <p className="text-base text-muted-foreground">
            You will be able to work in multiple organisations.
          </p>
        </div>
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-full"
        >
          <div className="max-w-s form-control w-full">
            <Field name="organization.name">
              <TextInputField placeholder="Type organization’s name" />
              <FieldMessage>This will be visible only to you</FieldMessage>
            </Field>
          </div>
          <SubmitButton size="lg" className="mt-14 mx-auto">
            Create organisation
          </SubmitButton>
        </ValidatedForm>
      </div>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Organization',
    },
  ];
});
