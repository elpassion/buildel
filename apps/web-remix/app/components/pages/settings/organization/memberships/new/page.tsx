import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';

import { CreateInvitationSchema } from '~/api/organization/organization.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { ValidatedForm, withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';

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
          <FieldLabel>Email</FieldLabel>
          <TextInputField
            type="email"
            autoFocus
            placeholder="eg. test@example.com"
          />
          <FieldMessage>Email of the user to be registered</FieldMessage>
        </Field>
      </div>
      <SubmitButton size="sm">Invite member</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Member',
    },
  ];
});
