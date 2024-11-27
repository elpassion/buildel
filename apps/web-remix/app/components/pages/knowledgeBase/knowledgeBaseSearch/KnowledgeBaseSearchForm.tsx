import React, { useMemo } from 'react';
import { Loader, Search } from 'lucide-react';
import { useFormContext, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import type { IKnowledgeBaseFileListResponse } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { NumberInputField } from '~/components/form/fields/number.field';
import { SelectField } from '~/components/form/fields/select.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';
import { withZod } from '~/utils/form';

import { ExtendChunksField } from '../components/ExtendChunksToggleField';
import { SearchParams } from '../components/SearchParams';
import { SearchSchema } from '../search.schema';

interface KnowledgeBaseSearchFormProps {
  defaultValue?: Partial<z.TypeOf<typeof SearchSchema>>;
  fileList: IKnowledgeBaseFileListResponse;
}

export const KnowledgeBaseSearchForm: React.FC<
  KnowledgeBaseSearchFormProps
> = ({ defaultValue, fileList }) => {
  const validator = useMemo(() => withZod(SearchSchema), []);
  const memoryOptions = useMemo(() => {
    return fileList.map((item) => ({
      id: item.id,
      value: item.id,
      label: item.file_name,
    }));
  }, []);

  return (
    <ValidatedForm
      method="GET"
      validator={validator}
      defaultValues={defaultValue}
      noValidate
      className="flex gap-2 w-full"
    >
      <SearchParams>
        <Field name="limit">
          <FieldLabel>Results limit</FieldLabel>
          <NumberInputField
            placeholder="eg. 10"
            defaultValue={defaultValue?.limit}
          />
          <FieldMessage>
            Limit the number of results returned by the search. Default is 10.
          </FieldMessage>
        </Field>

        <Field name="token_limit">
          <FieldLabel>Tokens limit</FieldLabel>
          <NumberInputField
            placeholder="eg. 500"
            defaultValue={defaultValue?.token_limit}
          />
          <FieldMessage>
            Limit the number of tokens returned by the search. Disabled by
            default.
          </FieldMessage>
        </Field>

        <Field name="extend_neighbors">
          <ExtendChunksField
            defaultChecked={defaultValue?.extend_neighbors}
            label="Extend neighbors"
            supportingText="Extend the search to include neighbor chunks"
          />
        </Field>

        <Field name="extend_parents">
          <ExtendChunksField
            defaultChecked={defaultValue?.extend_parents}
            label="Extend parents"
            supportingText="Extend the search to include the whole context of the parent chunk"
          />
        </Field>

        <Field name="memory_id">
          <FieldLabel>Memory</FieldLabel>
          <SelectField
            allowClear
            placeholder="Memory name"
            options={memoryOptions}
            getPopupContainer={(node) => node.parentElement}
          />
          <FieldMessage>
            Filter the search to a specific memory file. Disabled by default.
          </FieldMessage>
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
      className={cn('text-muted-foreground', {
        'animate-spin': isSubmitting,
      })}
    />
  );
}
