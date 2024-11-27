import React, { useMemo, useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import type { loader } from '~/components/pages/knowledgeBase/newCollectionFiles/loader.server';
import { useCrawlUrls } from '~/components/pages/knowledgeBase/newCollectionFiles/useCrawlUrls';
import { loadingToast } from '~/components/toasts/loadingToast';
import { Button } from '~/components/ui/button';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

const ScrapeSchema = z.object({
  url: z.string().url(),
});

export function ScrapePage() {
  const { organizationId, collectionId, collectionName } =
    useLoaderData<typeof loader>();
  const revalidate = useRevalidator();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validator = useMemo(() => withZod(ScrapeSchema), []);

  const { crawl } = useCrawlUrls(organizationId);

  const submit = async (
    data: z.TypeOf<typeof ScrapeSchema>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setIsSubmitting(true);

    loadingToast(
      async () => {
        try {
          await crawl({
            memory_collection_id: collectionId.toString(),
            urls: [data.url],
          });

          revalidate.revalidate();
          navigate(routes.collectionFiles(organizationId, collectionName));

          return Promise.resolve({
            title: 'Website were crawled successfully.',
            description: 'You can now view the files in the collection.',
          });
        } catch {
          return Promise.reject({
            title: 'Website could not be crawled.',
            description: 'Please try again later.',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        loading: {
          title: "We're crawling the website.",
          description: 'Please do not close or refresh the app.',
        },
      },
    );
  };

  return (
    <ValidatedForm validator={validator} onSubmit={submit} noValidate>
      <Field name="url">
        <FieldLabel>Website</FieldLabel>
        <TextInputField className="w-full pr-[78px]" />

        <FieldMessage>Enter the URL to scrape single website</FieldMessage>
      </Field>

      <Button
        isFluid
        size="sm"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="mt-4"
      >
        Scrape and upload to KB
      </Button>
    </ValidatedForm>
  );
}
