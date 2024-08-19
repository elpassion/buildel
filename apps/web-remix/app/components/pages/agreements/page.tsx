import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { UpdateUserSchema } from '~/api/CurrentUserApi';
import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SubmitButton } from '~/components/form/submit';
import { metaWithDefaults } from '~/utils/metadata';

import type { loader } from './loader.server';

export function AgreementsPage() {
  const { user } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(UpdateUserSchema), []);

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-2">
      <div className="w-full max-w-lg rounded-lg text-center">
        <div className="flex flex-col gap-2 mb-12">
          <h1 className="text-2xl font-bold  ">Set Your Preferences</h1>
          <p className="text-base text-muted-foreground">
            Decide how you'd like to stay informed by selecting the options
            below. Your choices will guide our communication with you.
          </p>
        </div>

        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-full"
          defaultValues={{
            marketing_agreement: user.marketing_agreement ?? false,
          }}
        >
          <div className="w-full">
            <Field name="marketing_agreement">
              <FieldLabel className="flex gap-1 items-center justify-center">
                <CheckboxInputField />
                <span>Receive Marketing Communications</span>
              </FieldLabel>

              <FieldMessage>
                Subscribe to receive our newsletters with the latest updates.
                You can unsubscribe anytime.
              </FieldMessage>
            </Field>
          </div>

          <SubmitButton size="lg" className="mt-14 mx-auto">
            Confirm
          </SubmitButton>
        </ValidatedForm>
      </div>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Agreements',
    },
  ];
});
