import React, { useMemo } from "react";
import { ItemList } from "~/components/list/ItemList";
import { Badge } from "@elpassion/taco";

interface BlockInputListProps {
  inputs: string[];
}

export const BlockInputList: React.FC<BlockInputListProps> = ({ inputs }) => {
  const formattedInputs: IItem[] = useMemo(
    () =>
      inputs.map((input) => ({
        id: input,
        originalValue: input,
        value: input.split(":").at(0),
      })),
    [inputs]
  );

  if (inputs.length === 0) return null;

  return (
    <div>
      <h4 className="mb-1 font-medium text-white text-xs">Inputs</h4>
      <ItemList
        className="flex flex-wrap gap-2"
        items={formattedInputs}
        renderItem={(item) => <BlockInputItem {...item} />}
      />
    </div>
  );
};

interface IItem {
  id: string;
  originalValue: string;
  value?: string;
}

function BlockInputItem({ value, originalValue }: IItem) {
  return <Badge text={value || originalValue} size="xs" />;
}
