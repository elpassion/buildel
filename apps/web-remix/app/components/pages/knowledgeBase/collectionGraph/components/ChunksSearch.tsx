import type { FormEvent } from 'react';
import React, { useMemo } from 'react';
import { useNavigate } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Loader, Search } from 'lucide-react';
import { useFormContext, ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';

import { Field } from '~/components/form/fields/field.context';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';

interface ChunksSearchProps {
  defaultValue: string;
}

const schema = z.object({ query: z.string() });

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

    navigate({
      pathname: url.pathname,
      search: searchParams.toString(),
    });
  };

  return (
    <div
      className="relative w-full max-w-[250px] pointer-events-auto"
      key={defaultValue}
    >
      <ValidatedForm
        validator={validator}
        defaultValues={{ query: defaultValue }}
        onSubmit={onSubmit}
      >
        <Field name="query">
          <TextInputField
            placeholder="Ask a question..."
            className="h-9 pr-8"
          />
          <FieldMessage />
        </Field>

        <div className="absolute top-[18px] right-1 -translate-y-1/2">
          <SearchButton />
        </div>
      </ValidatedForm>
    </div>
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
