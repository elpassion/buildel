import React, { useMemo, useState } from 'react';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { NumberInputField } from '~/components/form/fields/number.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { errorToast } from '~/components/toasts/errorToast';
import { successToast } from '~/components/toasts/successToast';

import type { loader } from '../loader.server';

const CrawlSchema = z.object({
  url: z.string().url(),
  memory_collection_id: z.string(),
  max_depth: zfd
    .numeric()
    .refine(
      (value) => value >= 1 && value <= 3,
      'Max depth must be greater than 0 and less than 4',
    )
    .optional(),
});

type ICrawlSchema = z.TypeOf<typeof CrawlSchema>;

export const CollectionCrawlForm = () => {
  const revalidator = useRevalidator();
  const { organizationId, collectionId } = useLoaderData<typeof loader>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const validator = useMemo(() => withZod(CrawlSchema), []);

  async function crawlWebsite(data: ICrawlSchema) {
    const res = await fetch(
      `/super-api/organizations/${organizationId}/tools/crawls`,
      {
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
        method: 'POST',
      },
    );

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body?.errors?.detail ?? 'Something went wrong!');
    }

    return res.json();
  }

  const onSubmit = async (
    data: ICrawlSchema,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    setIsSubmitting(true);
    e.preventDefault();

    try {
      await crawlWebsite(data);
      successToast('Website(s) crawled successfully');
      revalidator.revalidate();
      //eslint-disable-next-line
      //@ts-ignore
      e.target?.reset?.();
    } catch (error) {
      if (error instanceof Error) {
        errorToast(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ValidatedForm
      method="PUT"
      validator={validator}
      onSubmit={onSubmit}
      defaultValues={{ max_depth: 1 }}
      className="space-y-4"
    >
      <HiddenField name="memory_collection_id" value={collectionId} />

      <div>
        <Field name="url">
          <FieldLabel>Url</FieldLabel>
          <TextInputField placeholder="Type a url..." />
          <FieldMessage>Url to crawl from</FieldMessage>
        </Field>
      </div>

      <div>
        <Field name="max_depth">
          <FieldLabel>Max depth</FieldLabel>
          <NumberInputField />
          <FieldMessage>Maximum depth to crawl</FieldMessage>
        </Field>
      </div>

      <SubmitButton
        size="sm"
        isFluid
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        Crawl
      </SubmitButton>
    </ValidatedForm>
  );
};
