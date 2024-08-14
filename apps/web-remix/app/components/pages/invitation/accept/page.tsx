import type { MetaFunction } from '@remix-run/node';

import { metaWithDefaults } from '~/utils/metadata';

export function AcceptPage() {
  return null;
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Accept',
    },
  ];
});
