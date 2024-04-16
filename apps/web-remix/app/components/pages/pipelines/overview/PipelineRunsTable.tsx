import React from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IPipelineRun,
  IPipelineRuns,
} from "~/components/pages/pipelines/pipeline.types";
import { Indicator } from "@elpassion/taco";
import { dayjs } from "~/utils/Dayjs";
import { EmptyMessage } from "~/components/list/ItemList";
import { StopRunForm } from "~/components/pages/pipelines/overview/StopRunForm";

interface PipelineRunsTableProps {
  data: IPipelineRuns;
}

const columnHelper = createColumnHelper<IPipelineRun>();

const columns = [
  columnHelper.accessor("created_at", {
    header: "Date",
    id: "created_at",
    cell: (info) => dayjs(info.getValue()).format("DD MMM HH:mm"),
  }),
  columnHelper.accessor("status", {
    id: "status",
    cell: (info) => (
      <Indicator
        type={info.getValue() !== "finished" ? "warning" : "success"}
        variant="badge"
        text={info.getValue()}
      />
    ),
    header: "Status",
  }),
  columnHelper.accessor("costs", {
    header: "Run costs ($)",
    id: "costs",
    cell: (info) =>
      info
        .getValue()
        .reduce((acc, curr) => acc + Number(curr.data.amount), 0)
        .toFixed(10),
  }),
  columnHelper.accessor("costs", {
    header: "Input tokens",
    id: "input_tokens",
    cell: (info) =>
      info
        .getValue()
        .reduce((acc, curr) => acc + Number(curr.data.input_tokens), 0),
  }),
  columnHelper.accessor("costs", {
    header: "Output tokens",
    id: "output_tokens",
    cell: (info) =>
      info
        .getValue()
        .reduce((acc, curr) => acc + Number(curr.data.output_tokens), 0),
  }),

  columnHelper.accessor("status", {
    header: "",
    id: "action",
    maxSize: 20,
    cell: (info) => {
      return info.getValue() === "running" ? (
        <StopRunForm id={info.row.original.id} />
      ) : null;
    },
  }),
];

export const PipelineRunsTable: React.FC<PipelineRunsTableProps> = ({
  data,
}) => {
  const table = useReactTable({
    data,
    columns,
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
                className="py-3 px-5 first:rounded-tl-sm first:rounded-bl-sm last:rounded-tr-sm last:rounded-br-sm"
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
              <EmptyMessage>There are no pipeline runs...</EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-t border-neutral-800">
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
