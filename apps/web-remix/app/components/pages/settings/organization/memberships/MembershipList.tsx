import { IMembership } from "~/components/pages/settings/organization/organization.types";
import { ItemList } from "~/components/list/ItemList";
import classNames from "classnames";

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
      className={classNames(
        "group bg-neutral-800 px-4 py-4 rounded-lg text-basic-white text-sm"
      )}
    >
      {membership.user.email}
    </article>
  );
};
