import { useFetcher } from '@remix-run/react';
import { Icon } from '@elpassion/taco';
import classNames from 'classnames';
import { Trash } from 'lucide-react';

import type { IInvitation } from '~/api/organization/organization.contracts';
import { IconButton } from '~/components/iconButton';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
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
        <p className="text-neutral-100 text-sm">
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
      className={classNames(
        'group bg-neutral-800 px-4 py-4 rounded-lg text-basic-white grid grid-cols-[130px_1fr_32px] items-center gap-4 text-sm',
      )}
    >
      <p>{dayjs(invitation.expires_at).format()}</p>

      <p>{invitation.email}</p>

      <IconButton
        size="xxs"
        variant="ghost"
        aria-label={`Delete invitation: ${invitation.email}`}
        className="group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500 lg:opacity-0"
        title={`Delete invitation: ${invitation.email}`}
        icon={<Trash />}
        onClick={handleDelete}
      />
    </article>
  );
};
