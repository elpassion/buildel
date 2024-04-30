import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Indicator } from "@elpassion/taco";
import { dayjs } from "~/utils/Dayjs";
import { EmptyMessage } from "~/components/list/ItemList";
import { IKnowledgeBaseCollectionCost } from "../knowledgeBase.types";
import { HelpfulIcon } from "~/components/tooltip/HelpfulIcon";

interface CollectionCostsTableProps {
  data: IKnowledgeBaseCollectionCost[];
}

const columnHelper = createColumnHelper<IKnowledgeBaseCollectionCost>();

export const CollectionCostsTable: React.FC<CollectionCostsTableProps> = ({
  data,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("created_at", {
        header: "Date",
        id: "created_at",
        cell: (info) => dayjs(info.getValue()).format("DD MMM HH:mm"),
      }),
      columnHelper.accessor("cost_type", {
        id: "cost_type",
        cell: (info) => (
          <Indicator
            type={info.getValue() === "query" ? "success" : "processing"}
            variant="badge"
            text={info.getValue()}
          />
        ),
        header: "Cost type",
      }),
      columnHelper.accessor("amount", {
        header: "Collection costs ($)",
        id: "amount",
        cell: (info) =>
          info
            .getValue(),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        id: "description",
        cell: (info) => {
          const value = info.getValue()

          return value.length > 20
            ? <>
              {`${value.slice(0, 17)}... `}
              <HelpfulIcon
                id={`inputs-helpful-icon`}
                text={value}
                size="sm"
                place="right"
              />
            </> : value
        },
      }),
      columnHelper.accessor("input_tokens", {
        header: "Input tokens",
        id: "input_tokens",
        cell: (info) =>
          info
            .getValue()
      }),
      columnHelper.accessor("output_tokens", {
        header: "Output tokens",
        id: "output_tokens",
        cell: (info) =>
          info
            .getValue()
      })
    ],
    []
  );

  const tableData = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full">
      <thead className="text-left text-white text-xs bg-neutral-800">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="rounded-xl overflow-hidden">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td className="py-2 mx-auto">
              <EmptyMessage>There are no collection costs...</EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="[&:not(:first-child)]:border-t border-neutral-800"
            aria-label="pipeline run"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-3 px-5 text-neutral-100 text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
