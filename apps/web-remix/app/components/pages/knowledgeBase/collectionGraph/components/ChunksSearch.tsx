import type { FormEvent } from 'react';
import { useMemo } from 'react';
import { useNavigate } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Loader, Search, X } from 'lucide-react';
import { useFormContext, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { NumberInputField } from '~/components/form/fields/number.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';

import { ExtendChunksField } from '../../components/ExtendChunksToggleField';
import { SearchParams } from '../../components/SearchParams';
import { SearchSchema } from '../../search.schema';

interface ChunksSearchProps {
  defaultValue: Partial<z.TypeOf<typeof SearchSchema>>;
}

const schema = SearchSchema;

export const ChunksSearch = ({ defaultValue }: ChunksSearchProps) => {
  const navigate = useNavigate();
  const validator = useMemo(() => withZod(schema), []);

  const onSubmit = async (
    values: z.TypeOf<typeof schema>,
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const url = new URL(window.location.href);

    const searchParams = new URLSearchParams(url.search);
    searchParams.set('query', values.query);
    searchParams.set('limit', values.limit?.toString() ?? '');
    if (searchParams.get('limit') === '') searchParams.delete('limit');
    searchParams.set('token_limit', values.token_limit?.toString() ?? '');
    if (searchParams.get('token_limit') === '')
      searchParams.delete('token_limit');
    searchParams.set('extend_neighbors', values.extend_neighbors.toString());
    searchParams.set('extend_parents', values.extend_parents.toString());

    navigate({
      pathname: url.pathname,
      search: searchParams.toString(),
    });
  };

  return (
    <div
      className="relative w-full max-w-[400px] pointer-events-auto"
      key={defaultValue.query}
    >
      <ValidatedForm
        validator={validator}
        defaultValues={{ query: defaultValue.query }}
        onSubmit={onSubmit}
        className="flex gap-1 w-full items-start"
      >
        <SearchParams>
          <Field name="limit">
            <FieldLabel>Results limit</FieldLabel>
            <NumberInputField
              placeholder="eg. 10"
              defaultValue={defaultValue.limit}
            />
            <FieldMessage>
              Limit the number of results returned by the search. Default is 10.
            </FieldMessage>
          </Field>

          <Field name="token_limit">
            <FieldLabel>Tokens limit</FieldLabel>
            <NumberInputField
              placeholder="eg. 500"
              defaultValue={defaultValue.token_limit}
            />
            <FieldMessage>
              Limit the number of tokens returned by the search. Disabled by
              default.
            </FieldMessage>
          </Field>

          <Field name="extend_neighbors">
            <ExtendChunksField
              defaultChecked={defaultValue.extend_neighbors}
              label="Extend neighbors"
              supportingText="Extend the search to include neighbor chunks"
            />
          </Field>

          <Field name="extend_parents">
            <ExtendChunksField
              defaultChecked={defaultValue.extend_parents}
              label="Extend parents"
              supportingText="Extend the search to include the whole context of the parent chunk"
            />
          </Field>
        </SearchParams>
        <Field name="query">
          <div className="relative w-full">
            <TextInputField
              placeholder="Ask a question..."
              className="h-9 pr-8"
              defaultValue={defaultValue.query}
            />
            <FieldMessage />

            <div className="absolute top-[18px] right-1 -translate-y-1/2">
              <SearchButton />
            </div>
          </div>
        </Field>
        <ClearButton />
      </ValidatedForm>
    </div>
  );
};

function ClearButton() {
  const { getValues } = useFormContext();
  const navigate = useNavigate();

  const formData = getValues();

  const query = formData.get('query');

  return (
    <IconButton
      icon={<X />}
      variant="outline"
      size="sm"
      disabled={!query}
      onClick={(e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        searchParams.delete('query');
        navigate({
          pathname: url.pathname,
          search: searchParams.toString(),
        });
      }}
    />
  );
}

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
