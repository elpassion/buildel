import React, { useMemo, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateCollectionSchema } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { NumberInputField } from '~/components/form/fields/number.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import {
  ApiTypesRadioGroupField,
  ModelSelectField,
  SecretSelectField,
} from '~/components/pages/knowledgeBase/KnowledgeBaseFields';

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(CreateCollectionSchema), []);
  const [_, setWatchedValues] = useState<Record<string, any>>({});

  const onValueChange = (name: string, value: unknown) => {
    setWatchedValues((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2"
      defaultValues={{
        embeddings: {
          api_type: 'openai',
          endpoint: 'https://api.openai.com/v1/embeddings',
        },
        chunk_size: 1000,
        chunk_overlap: 0,
      }}
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-3 space-y-1">
        <div>
          <Field name="collection_name">
            <FieldLabel>Name</FieldLabel>
            <TextInputField
              type="text"
              autoFocus
              placeholder="eg. My Collection"
            />
            <FieldMessage>
              It will help you identify the collection in BUILDEL
            </FieldMessage>
          </Field>
        </div>

        <div>
          <ApiTypesRadioGroupField
            onChange={(e) => onValueChange(e.target.name, e.target.value)}
          />
        </div>

        <div>
          <Field name="embeddings.endpoint">
            <FieldLabel>Endpoint</FieldLabel>
            <TextInputField type="text" name="endpoint" />
            <FieldMessage>
              API endpoint used for retrieving embeddings
            </FieldMessage>
          </Field>
        </div>

        <div>
          <ModelSelectField getPopupContainer={(node) => node.parentNode} />
        </div>

        <div>
          <SecretSelectField getPopupContainer={(node) => node.parentNode} />
        </div>

        <div>
          <Field name="chunk_size">
            <FieldLabel>Chunk size</FieldLabel>
            <NumberInputField placeholder="eg. 1000" />
            <FieldMessage>
              Size of the generated chunks in the collection.
            </FieldMessage>
          </Field>
        </div>

        <div>
          <Field name="chunk_overlap">
            <FieldLabel>Chunk overlap</FieldLabel>
            <NumberInputField placeholder="eg. 50" />
            <FieldMessage>
              Overlap between the generated chunks in the collection.
            </FieldMessage>
          </Field>
        </div>
      </div>

      <SubmitButton size="sm">Create collection</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Knowledge Base',
    },
  ];
};
