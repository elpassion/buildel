import React, { useMemo, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { UpdateCollectionSchema } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import {
  ApiTypesRadioGroupField,
  ModelSelectField,
  SecretSelectField,
} from '~/components/pages/knowledgeBase/KnowledgeBaseFields';

import type { loader } from './loader.server';

export function CollectionSettingsPage() {
  const { collection } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(UpdateCollectionSchema), []);
  const [_, setWatchedValues] = useState<Record<string, any>>({});

  const onValueChange = (name: string, value: unknown) => {
    setWatchedValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PageContentWrapper>
      <ValidatedForm
        noValidate
        method="put"
        validator={validator}
        className="w-full grow flex flex-col gap-2 mt-10"
        defaultValues={collection}
      >
        <HiddenField name="id" value={collection.id} />

        <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-5 space-y-1">
          <div className="flex gap-5 flex-col items-center justify-between md:flex-row">
            <div className="w-full">
              <Field name="name">
                <FieldLabel>Name</FieldLabel>
                <TextInputField
                  disabled
                  type="text"
                  autoFocus
                  placeholder="eg. My Collection"
                />
                <FieldMessage>
                  It will help you identify the collection in BUILDEL
                </FieldMessage>
              </Field>
            </div>

            <div className="w-full">
              <Field name="embeddings.endpoint">
                <FieldLabel>Endpoint</FieldLabel>
                <TextInputField disabled type="text" name={'endpoint'} />
                <FieldMessage>
                  API endpoint used for retrieving embeddings
                </FieldMessage>
              </Field>
            </div>
          </div>

          <div className="flex gap-5 flex-col items-center justify-between md:flex-row">
            <div className="w-full">
              <ModelSelectField disabled />
            </div>

            <div className="w-full">
              <SecretSelectField />
            </div>
          </div>

          <div>
            <ApiTypesRadioGroupField
              disabled
              onChange={(e) => onValueChange(e.target.name, e.target.value)}
            />
          </div>
        </div>
        <SubmitButton className="mt-10 max-w-[200px]" size="sm">
          Update collection
        </SubmitButton>
      </ValidatedForm>
    </PageContentWrapper>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Collection settings',
    },
  ];
};
