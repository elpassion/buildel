import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { LRUCache } from 'lru-cache';

import { loaderBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';

export type WebsiteMeta = {
  title: string | null;
  description: string | null;
};

const cache = new LRUCache<string, WebsiteMeta>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
});

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }) => {
    try {
      const url = new URL(request.url);
      const queryUrl = url.searchParams.get('url');
      assert(queryUrl, 'Missing query url');

      if (cache.has(queryUrl)) {
        return json(cache.get(queryUrl));
      }

      const response = await fetch(new URL(queryUrl).origin, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +https://www.google.com/bot.html)',
          Referer: 'https://www.google.com/',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        return json(null, { status: response.status });
      }

      const html = await response.text();
      const titleMatch = RegExp(/<title[^>]*>([^<]*)<\/title>/i).exec(html);

      const descriptionMatch = RegExp(
        /<meta[^>]*(?:name|property|itemprop)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["']/i,
      ).exec(html);

      const title = titleMatch ? titleMatch[1] : null;
      const description = descriptionMatch ? descriptionMatch[1] : null;

      cache.set(queryUrl, { title, description });

      return json({ title, description });
    } catch (err) {
      return json(null, { status: 400 });
    }
  })(args);
}
