import { useFetcher } from '@remix-run/react';
import { Trash } from 'lucide-react';

import type { IInvitation } from '~/api/organization/organization.contracts';
import { IconButton } from '~/components/iconButton';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';

interface InvitationsListProps {
  invitations: IInvitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const fetcher = useFetcher();

  const handleDelete = async (invitationId: number) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ invitationId }, { method: 'DELETE' }),
      confirmText: 'Delete invitation',
      children: (
        <p className="text-sm">
          You are about to delete the invitation. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      items={invitations}
      emptyText={
        <EmptyMessage>There are no pending invitations...</EmptyMessage>
      }
      renderItem={(invitation) => (
        <InvitationsListItem invitation={invitation} onDelete={handleDelete} />
      )}
      className="flex flex-col gap-2"
    />
  );
}

interface InvitationsListItemProps {
  invitation: IInvitation;
  onDelete: (invitationId: number) => void;
}
export const InvitationsListItem = ({
  invitation,
  onDelete,
}: InvitationsListItemProps) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(invitation.id);
  };

  return (
    <article
      className={cn(
        'group bg-muted px-4 py-4 rounded-lg text-foreground grid grid-cols-[130px_1fr_32px] items-center gap-4 text-sm',
      )}
    >
      <p>{dayjs(invitation.expires_at).format()}</p>

      <p>{invitation.email}</p>

      <IconButton
        size="xxs"
        variant="secondary"
        className="hover:bg-primary hover:text-primary-foreground"
        aria-label={`Delete invitation: ${invitation.email}`}
        title={`Delete invitation: ${invitation.email}`}
        icon={<Trash />}
        onClick={handleDelete}
      />
    </article>
  );
};
