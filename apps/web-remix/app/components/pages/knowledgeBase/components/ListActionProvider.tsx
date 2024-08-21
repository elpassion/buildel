import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FetcherWithComponents } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';

import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

interface IListActionContext {
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  showActions: boolean;
  selectedItems: string[];
  clearSelection: () => void;
  removeItem: (id: string) => void;
}

const ListActionContext = createContext<IListActionContext | undefined>(
  undefined,
);

interface ListActionProviderProps {
  onRemove?: (id: string) => Promise<void>;
}

export const ListActionProvider = ({
  children,
}: PropsWithChildren<ListActionProviderProps>) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => {
      return prev.filter((item) => item !== id);
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const isSelected = (id: string) => selectedItems.includes(id);

  return (
    <ListActionContext.Provider
      value={{
        toggleSelection,
        isSelected,
        selectedItems,
        clearSelection,
        removeItem,
        showActions: selectedItems.length > 0,
      }}
    >
      {children}
    </ListActionContext.Provider>
  );
};

export const useListAction = () => {
  const context = useContext(ListActionContext);
  if (context === undefined) {
    throw new Error('useListAction must be used within a ListActionProvider');
  }
  return context;
};

interface FloatingListActionsProps {
  onDelete: (fetcher: FetcherWithComponents<unknown>, ids: string[]) => void;
}

export const FloatingListActions = ({ onDelete }: FloatingListActionsProps) => {
  const fetcher = useFetcher();
  const { showActions, selectedItems, clearSelection } = useListAction();

  const deleteItems = async () => {
    onDelete(fetcher, selectedItems);
  };

  const isDisabled = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'idle') {
      clearSelection();
    }
  }, [fetcher.state]);

  return (
    <div
      className={cn(
        '!p-2 fixed z-[5] bg-white bottom-2 left-1/2 -translate-x-1/2 border border-input w-[95%] max-w-[400px] rounded-lg flex gap-2 items-center justify-between',
        {
          'opacity-100 pointer-events-auto': showActions,
          'opacity-0 pointer-events-none': !showActions,
        },
      )}
    >
      <p>{selectedItems.length} item(s) selected</p>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={deleteItems}
          isLoading={isDisabled}
          disabled={isDisabled}
        >
          Delete
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={clearSelection}
          isLoading={isDisabled}
          disabled={isDisabled}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

type FloatingListCheckboxProps = {
  itemId: string;
};
export const FloatingListCheckbox = ({ itemId }: FloatingListCheckboxProps) => {
  const { isSelected, toggleSelection } = useListAction();

  const isChecked = isSelected(itemId);

  const toggle = () => {
    toggleSelection(itemId);
  };

  return (
    <label
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className={cn(
        'absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 z-[1] bg-white w-7 h-7 flex justify-center items-center rounded-md border border-input transition opacity-0 pointer-events-none lg:group-hover:opacity-100 group-hover:pointer-events-auto',
        {
          'lg:opacity-100 lg:pointer-events-auto': isChecked,
        },
      )}
    >
      <CheckboxInput
        onCheckedChange={toggle}
        checked={isChecked}
        className={cn({
          'data-[state=checked]:bg-red-500 data-[state=checked]:text-white data-[state=checked]:border-red-500':
            isChecked,
        })}
      />
    </label>
  );
};
