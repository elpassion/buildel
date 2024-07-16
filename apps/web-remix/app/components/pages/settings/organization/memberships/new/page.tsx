import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateInvitationSchema } from '~/api/organization/organization.contracts';
import { Field } from '~/components/form/fields/field.context';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';

export function NewMembershipPage() {
  const validator = useMemo(() => withZod(CreateInvitationSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="invitation.email">
          <TextInputField
            type="email"
            autoFocus
            placeholder="eg. test@example.com"
            supportingText="Email of the user to be registered"
            label="Email"
          />
        </Field>
      </div>
      <SubmitButton size="sm" hierarchy="primary">
        Invite member
      </SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Member',
    },
  ];
};
