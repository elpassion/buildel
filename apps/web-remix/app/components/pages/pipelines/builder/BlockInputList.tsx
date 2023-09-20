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

  return (
    <ItemList
      items={formattedInputs}
      renderItem={(item) => <BlockInputItem {...item} />}
    />
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
