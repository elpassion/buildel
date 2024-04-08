import { IMembership } from "~/components/pages/settings/organization/organization.types";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import classNames from "classnames";

interface InvitationsListProps {
  invitations: IMembership[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  return (
    <ItemList
      items={invitations}
      emptyText={
        <EmptyMessage>There are no pending invitations...</EmptyMessage>
      }
      renderItem={(invitation) => (
        <InvitationsListItem invitation={invitation} />
      )}
      className="flex flex-col gap-2"
    />
  );
}

interface InvitationsListItemProps {
  invitation: IMembership;
}
export const InvitationsListItem = ({
  invitation,
}: InvitationsListItemProps) => {
  return (
    <article
      className={classNames(
        "group bg-neutral-800 px-4 py-4 rounded-lg text-basic-white"
      )}
    >
      {invitation.user.email}
    </article>
  );
};
