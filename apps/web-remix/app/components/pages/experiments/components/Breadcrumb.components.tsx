import type { PageContentWrapperProps } from '~/components/layout/PageContentWrapper';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';

export const BreadcrumbWrapper = ({ children }: PageContentWrapperProps) => {
  return (
    <PageContentWrapper className="absolute top-[130px] left-1/2 -translate-x-1/2">
      {children}
    </PageContentWrapper>
  );
};
