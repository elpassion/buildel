import { errorToast } from '~/components/toasts/errorToast';

export interface CrawlBulkData {
  urls: string[];
  memory_collection_id: string;
}

export const useCrawlUrls = (organizationId: string) => {
  const crawlUrls = async (data: CrawlBulkData) => {
    async function crawl(data: CrawlBulkData) {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/tools/crawls/bulk`,
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

    async function refreshCrawlState(memoryCollectionId: string) {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/tools/crawls?memory_collection_id=${memoryCollectionId}`,
      );

      if (!res.ok) {
        const body = await res.json();
        errorToast('Something went wrong!');
        throw new Error(body?.errors?.detail ?? 'Something went wrong!');
      }

      const data = await res.json();

      if (data.data.length > 0) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            refreshCrawlState(memoryCollectionId).then(resolve).catch(reject);
          }, 1000);
        });
      } else {
        return data;
      }
    }

    await crawl(data);
    await refreshCrawlState(data.memory_collection_id);
  };

  return { crawl: crawlUrls };
};
