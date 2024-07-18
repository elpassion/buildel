import React, { useMemo } from 'react';
import { Icon } from '@elpassion/taco';
import { withZod } from '@remix-validated-form/with-zod';
import classNames from 'classnames';
import { useFormContext, ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
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
      className="flex gap-2 w-full "
    >
      <SearchParams>
        <Field name="limit">
          <NumberInputField
            label="Results limit"
            placeholder="eg. 10"
            supportingText="Limit the number of results returned by the search. Default is 10."
          />
        </Field>

        <Field name="token_limit">
          <NumberInputField
            label="Tokens limit"
            placeholder="eg. 500"
            supportingText="Limit the number of tokens returned by the search. Disabled by default."
          />
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
          <TextInputField
            placeholder="Ask a question..."
            inputClassName="!pr-8"
          />

          <div className="absolute top-[21px] right-3 -translate-y-1/2">
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
      icon={<Icon iconName={isSubmitting ? 'loader' : 'search'} />}
      aria-label="Search"
      className={classNames({ 'animate-spin': isSubmitting })}
    />
  );
}
