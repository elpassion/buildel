import { ItemList } from '~/components/list/ItemList';
import type { IMembership } from '~/components/pages/settings/organization/organization.types';
import { cn } from '~/utils/cn';

interface MembershipListProps {
  memberships: IMembership[];
}

export function MembershipList({ memberships }: MembershipListProps) {
  return (
    <ItemList
      items={memberships}
      renderItem={(membership) => (
        <MembershipListItem membership={membership} />
      )}
      className="flex flex-col gap-2"
    />
  );
}

interface MembershipListItemProps {
  membership: IMembership;
}
export const MembershipListItem = ({ membership }: MembershipListItemProps) => {
  return (
    <article
      className={cn(
        'group bg-muted px-4 py-4 rounded-lg text-foreground text-sm',
      )}
    >
      {membership.user.email}
    </article>
  );
};
