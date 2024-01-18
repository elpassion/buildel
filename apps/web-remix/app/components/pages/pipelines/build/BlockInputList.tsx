import React, { useMemo } from "react";
import { ItemList } from "~/components/list/ItemList";
import { Badge, Checkbox } from "@elpassion/taco";
import { useInputs } from "./EditBlockForm";

interface BlockInputListProps {
  inputs: string[];
}

export const BlockInputList: React.FC<BlockInputListProps> = ({ inputs }) => {
  const formattedInputs: IItem[] = useMemo(
    () =>
      inputs.map((input) => {
        const reset = input.split("?").at(1) !== "reset=false";
        return {
          id: input,
          originalValue: input,
          value: input.split(":").at(0),
          reset: reset,
        };
      }),
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
  reset: boolean;
}

function BlockInputItem({ value, originalValue, reset }: IItem) {
  const { updateInputReset } = useInputs();
  return (
    <>
      <Badge text={value || originalValue} size="xs" />
      <Checkbox
        checked={reset}
        onChange={(e) => {
          console.log("e.target.checked", e.target.checked);
          updateInputReset(originalValue, e.target.checked);
        }}
      />
    </>
  );
}
