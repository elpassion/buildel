import React, { useMemo, useState } from 'react';
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { EmptyMessage } from '~/components/list/ItemList';
import type { ICrawlSchema } from '~/components/pages/knowledgeBase/newCollectionFiles/components/CollectionCrawlForm';
import type { loader } from '~/components/pages/knowledgeBase/newCollectionFiles/loader.server';
import { errorToast } from '~/components/toasts/errorToast';
import { successToast } from '~/components/toasts/successToast';
import { CheckboxTree } from '~/components/treeSelect/CheckboxTree';
import type { TreeNodeType } from '~/components/treeSelect/Tree.types';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

export const DiscoverPages = () => {
  const fetcher = useFetcher<{ pages: string[] }>();

  const onDiscover = async (values: z.TypeOf<typeof DiscoverSchema>) => {
    fetcher.submit({ url: values.url }, { method: 'POST' });
  };

  if (fetcher.data) {
    if (fetcher.data.pages.length <= 0) {
      return <EmptyMessage>No pages found</EmptyMessage>;
    }
    const nodes = prepareNodes([...new Set(fetcher.data.pages)]);

    return <DiscoverPagesTree nodes={nodes} />;
  }

  return <DiscoverPagesForm onSubmit={onDiscover} />;
};

interface DiscoverPagesTreeProps {
  nodes: TreeNodeType[];
}

function DiscoverPagesTree({ nodes }: DiscoverPagesTreeProps) {
  const { organizationId, collectionId, collectionName } =
    useLoaderData<typeof loader>();
  const revalidate = useRevalidator();
  const navigate = useNavigate();
  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const expandedNode = nodes[0].children?.length ? [nodes[0].value] : [];

  // @todo Rewrite this on monday. Use batch crawl etc.
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

  const submit = async () => {
    setIsSubmitting(true);

    try {
      await Promise.all(
        checkedNodes.map((url) => {
          return crawlWebsite({
            url,
            memory_collection_id: collectionId.toString(),
            max_depth: 1,
          });
        }),
      );
      successToast('Website(s) crawled successfully');
      revalidate.revalidate();
      navigate(routes.collectionFiles(organizationId, collectionName));
    } catch (error) {
      if (error instanceof Error) {
        errorToast(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-h-[350px] overflow-y-auto">
        <CheckboxTree
          nodes={nodes}
          onCheckedChange={setCheckedNodes}
          defaultExpanded={expandedNode}
        />
      </div>
      <div className="mt-6 flex gap-1">
        <Button variant="outline" size="sm" isFluid>
          Cancel
        </Button>

        <Button
          disabled={checkedNodes.length === 0 || isSubmitting}
          isLoading={isSubmitting}
          size="sm"
          isFluid
          onClick={submit}
        >
          Add {checkedNodes.length ?? ''} page(s)
        </Button>
      </div>
    </div>
  );
}

const DiscoverSchema = z.object({
  url: z.string().url(),
});

interface DiscoverPagesFormProps {
  onSubmit: (values: z.TypeOf<typeof DiscoverSchema>) => void;
}

function DiscoverPagesForm({ onSubmit }: DiscoverPagesFormProps) {
  const validator = useMemo(() => withZod(DiscoverSchema), []);

  const submit = (
    data: z.TypeOf<typeof DiscoverSchema>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    onSubmit(data);
  };

  return (
    <ValidatedForm validator={validator} onSubmit={submit} noValidate>
      <Field name="url">
        <FieldLabel>Website</FieldLabel>
        <div className="relative w-full">
          <TextInputField className="w-full pr-[78px]" />
          <DiscoverButton />
        </div>
        <FieldMessage>Enter the website URL to discover pages</FieldMessage>
      </Field>
    </ValidatedForm>
  );
}

function DiscoverButton() {
  return (
    <SubmitButton
      variant="ghost"
      size="xxs"
      className="absolute top-1/2 right-2 -translate-y-1/2"
    >
      Discover
    </SubmitButton>
  );
}

type PageTreeNode = TreeNodeType<{
  url: string;
  segment: string;
  host: string;
  protocol: string;
}>;
function prepareNodes(urls: string[]) {
  if (urls.length === 0) return [];

  const { host, protocol } = extractUrl(urls[0]);
  const rootUrl = `${protocol}//${host}`;

  const root: PageTreeNode = {
    value: '_group',
    segment: rootUrl,
    label: rootUrl,
    url: rootUrl,
    children: [],
    host,
    protocol,
  };

  urls.forEach((url) => {
    const { pathname, host, protocol } = extractUrl(url);
    const pathSegments = splitPathname(pathname);

    let currentNode = root;
    let accumulatedSegment = '';

    pathSegments.forEach((segment) => {
      accumulatedSegment += `/${segment}`;

      if (!currentNode.children) {
        currentNode.children = [];
      }

      let node = currentNode.children.find(
        (child) => child.value === accumulatedSegment,
      );
      if (!node) {
        node = {
          segment: accumulatedSegment,
          label: segment,
          value: accumulatedSegment,
          url: url,
          children: [],
          host,
          protocol,
        };
        currentNode.children.push(node);
      }

      currentNode = node;
    });
  });

  return [
    {
      ...root,
      children: [
        { ...root, children: [], label: '/', value: root.url },
        ...(root.children ?? []).map(formatNode),
      ],
    },
  ];
}

function formatNode(node: PageTreeNode): PageTreeNode {
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      label: node.segment,
      value: node.value + '_group',
      children: [
        {
          host: node.host,
          protocol: node.protocol,
          label: '/',
          segment: node.segment,
          value: buildUrl(node.host, node.segment, node.protocol),
          url: node.url,
          children: [],
        },
        ...node.children.map(formatNode),
      ],
    };
  } else {
    return {
      ...node,
      label: `/${node.label}`,
      value: buildUrl(node.host, node.segment, node.protocol),
    };
  }
}

function splitPathname(pathname: string) {
  return pathname.split('/').filter(Boolean);
}

function extractUrl(url: string) {
  const urlObj = new URL(url);

  return {
    protocol: urlObj.protocol,
    host: urlObj.host,
    pathname: urlObj.pathname,
  };
}

function buildUrl(host: string, pathname: string, protocol: string) {
  return `${protocol}//${host}${pathname}`;
}
