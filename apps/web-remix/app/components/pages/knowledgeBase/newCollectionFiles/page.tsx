import React from 'react';
import type { MetaFunction } from '@remix-run/node';

import { DiscoverPages } from '~/components/pages/knowledgeBase/newCollectionFiles/components/DiscoverPages';
import { Tab, TabButton } from '~/components/tabs/Tab';
import { TabGroup } from '~/components/tabs/TabGroup';
import { Button } from '~/components/ui/button';
import { metaWithDefaults } from '~/utils/metadata';

import { CollectionFilesUploadForm } from './components/CollectionFilesUploadForm';

export function NewCollectionFilesPage() {
  const [activeTab, setActiveTab] = React.useState('files');
  return (
    <>
      <TabGroup activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="w-full flex p-[3px] rounded-lg bg-muted mt-1 mb-3">
          <Button
            size="xxs"
            variant={activeTab === 'files' ? 'outline' : 'secondary'}
            asChild
            className="grow"
          >
            <TabButton tabId="files">Files</TabButton>
          </Button>
          <Button
            size="xxs"
            variant={activeTab === 'crawl' ? 'outline' : 'secondary'}
            asChild
            className="grow"
          >
            <TabButton tabId="crawl">Crawl</TabButton>
          </Button>
        </div>

        <Tab tabId="files">
          <CollectionFilesUploadForm />
        </Tab>

        <Tab tabId="crawl">
          <DiscoverPages />
          {/*<CollectionCrawlForm />*/}
        </Tab>
      </TabGroup>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New collection files',
    },
  ];
});
