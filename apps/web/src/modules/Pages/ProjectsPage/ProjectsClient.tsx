'use client';

import Link from 'next/link';
import { Indicator } from '@elpassion/taco';
import { Table } from '@elpassion/taco/Table';
import { ROUTES } from '~/modules/Config';

export const ProjectsClient = () => {
  return (
    <>
      <Table
        columns={[
          {
            className: 'w-40 min-w-40',
            id: 'name',
            isSortable: true,
            name: 'Name',
          },
          {
            className: 'w-40 min-w-40',
            id: 'apps',
            isSortable: true,
            name: 'Apps',
          },
          {
            className: 'w-40 min-w-40',
            id: 'usage',
            isSortable: true,
            name: 'Usage this month',
          },
        ]}
        data={[
          {
            id: '1',
            name: (
              <>
                <p>
                  <Link href={ROUTES.PROJECT('1')}>Project One</Link>
                </p>
              </>
            ),
            apps: (
              <>
                <Indicator variant="badge" text="1 app active" type="success" />
              </>
            ),
            usage: '$2.45',
          },
          {
            id: '2',
            name: (
              <>
                <p>
                  <Link href={ROUTES.PROJECT('2')}>Project Two</Link>
                </p>
              </>
            ),
            apps: (
              <>
                <Indicator
                  variant="badge"
                  text="No apps active"
                  type="default"
                />
              </>
            ),
            usage: '$5.45',
          },
        ]}
        layoutFixed
        withBuiltInPagination
      />
    </>
  );
};
