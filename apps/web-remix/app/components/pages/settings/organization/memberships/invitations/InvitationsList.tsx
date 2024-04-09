import classNames from "classnames";
import { EmptyMessage, ItemList } from "~/components/list/ItemList";
import { IInvitation } from "~/api/organization/organization.contracts";
import { dayjs } from "~/utils/Dayjs";

interface InvitationsListProps {
  invitations: IInvitation[];
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
  invitation: IInvitation;
}
export const InvitationsListItem = ({
  invitation,
}: InvitationsListItemProps) => {
  return (
    <article
      className={classNames(
        "group bg-neutral-800 px-4 py-4 rounded-lg text-basic-white grid grid-cols-[130px_1fr] gap-4 text-sm"
      )}
    >
      <p>{dayjs(invitation.expires_at).format()}</p>

      <p>{invitation.email}</p>
    </article>
  );
};
