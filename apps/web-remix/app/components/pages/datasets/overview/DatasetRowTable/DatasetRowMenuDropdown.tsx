import React from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { Edit, EllipsisVertical, Trash } from 'lucide-react';

import {
  MenuDropdown,
  MenuDropdownContent,
  MenuDropdownItem,
  MenuDropdownTrigger,
} from '~/components/dropdown/MenuDropdown';
import { confirm } from '~/components/modal/confirm';
import type { IDatasetRow } from '~/components/pages/datasets/dataset.types';
import { useDatasetId } from '~/hooks/useDatasetId';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { routes } from '~/utils/routes.utils';

interface DatasetRowMenuDropdownProps {
  data: IDatasetRow;
}

export const DatasetRowMenuDropdown = ({
  data,
}: DatasetRowMenuDropdownProps) => {
  const datasetId = useDatasetId();
  const organizationId = useOrganizationId();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const deleteRow = async () => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ rowId: data.id }, { method: 'DELETE' }),
      confirmText: 'Delete Row',
      children: (
        <p className="text-sm">
          You are about to delete the dataset row. This action is irreversible.
        </p>
      ),
    });
  };

  const editRow = () => {
    navigate(routes.datasetRow(organizationId, datasetId, data.id));
  };

  return (
    <MenuDropdown>
      <MenuDropdownTrigger
        className="w-8 h-8 p-0"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <EllipsisVertical className="w-4 h-4" />
      </MenuDropdownTrigger>

      <MenuDropdownContent>
        <MenuDropdownItem icon={<Edit />} onClick={editRow}>
          <span>Edit</span>
        </MenuDropdownItem>
        <MenuDropdownItem
          icon={<Trash />}
          variant="destructive"
          onClick={deleteRow}
        >
          <span>Delete</span>
        </MenuDropdownItem>
      </MenuDropdownContent>
    </MenuDropdown>
  );
};
