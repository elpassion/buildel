import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import classNames from 'classnames';
import { Loader, Search } from 'lucide-react';
import { useFormContext, ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { NumberInputField } from '~/components/form/fields/number.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { IconButton } from '~/components/iconButton';

import { ExtendChunksField } from './ExtendChunksToggleField';
import { SearchSchema } from './schema';
import { SearchParams } from './SearchParams';

interface KnowledgeBaseSearchFormProps {
  defaultValue?: string;
}

export const KnowledgeBaseSearchForm: React.FC<
  KnowledgeBaseSearchFormProps
> = ({ defaultValue }) => {
  const validator = useMemo(() => withZod(SearchSchema), []);

  return (
    <ValidatedForm
      method="GET"
      validator={validator}
      defaultValues={{ query: defaultValue }}
      noValidate
      className="flex gap-2 w-full"
    >
      <SearchParams>
        <Field name="limit">
          <FieldLabel>Results limit</FieldLabel>
          <NumberInputField placeholder="eg. 10" />
          <FieldMessage>
            Limit the number of results returned by the search. Default is 10.
          </FieldMessage>
        </Field>

        <Field name="token_limit">
          <FieldLabel>Tokens limit</FieldLabel>
          <NumberInputField placeholder="eg. 500" />
          <FieldMessage>
            Limit the number of tokens returned by the search. Disabled by
            default.
          </FieldMessage>
        </Field>

        <Field name="extend_neighbors">
          <ExtendChunksField
            label="Extend neighbors"
            supportingText="Extend the search to include neighbor chunks"
          />
        </Field>

        <Field name="extend_parents">
          <ExtendChunksField
            label="Extend parents"
            supportingText="Extend the search to include the whole context of the parent chunk"
          />
        </Field>
      </SearchParams>

      <Field name="query">
        <div className="relative w-full">
          <TextInputField placeholder="Ask a question..." className="!pr-8" />
          <FieldMessage />

          <div className="absolute top-[21px] right-1 -translate-y-1/2">
            <SearchButton />
          </div>
        </div>
      </Field>
    </ValidatedForm>
  );
};

function SearchButton() {
  const { isSubmitting } = useFormContext();

  return (
    <IconButton
      onlyIcon
      variant="ghost"
      size="xxs"
      icon={isSubmitting ? <Loader /> : <Search />}
      aria-label="Search"
      className={classNames({ 'animate-spin': isSubmitting })}
    />
  );
}
