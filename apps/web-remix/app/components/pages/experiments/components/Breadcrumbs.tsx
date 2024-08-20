import React from 'react';
import { useMatches } from '@remix-run/react';

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as UIBreadcrumb,
} from '~/components/ui/breadcrumb';

interface BreadcrumbProps {
  pathConfig: Record<
    string,
    string | number | null | { url: string; content: string }
  >;
}

export const Breadcrumbs = ({ pathConfig }: BreadcrumbProps) => {
  const matches = useMatches();

  const lastMatch = matches[matches.length - 1];

  const extractUrlParts = (url: string) => {
    return url
      .split('/')[1]
      .split('.')
      .map((urlPart) => urlPart.replace(/_/, ''))
      .map((urlPart) => urlPart.replace(/\$/, ''));
  };

  if (!lastMatch) return null;
  const urlParts = extractUrlParts(lastMatch.id).filter(
    (part) => !!pathConfig[part],
  );

  return (
    <UIBreadcrumb>
      <BreadcrumbList>
        {urlParts.map((urlPart, index) => {
          const config = pathConfig[urlPart];

          const content =
            config !== null && typeof config === 'object'
              ? config.content
              : config;
          const url =
            config !== null && typeof config === 'object' ? config.url : '';

          return (
            <React.Fragment key={urlPart}>
              <BreadcrumbItem>
                {index === urlParts.length - 1 ? (
                  <BreadcrumbPage>{content}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink to={url}>{content}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < urlParts.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
};
