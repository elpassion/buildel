import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DocumentationCTA } from "~/components/interfaces/DocumentationCTA";
import { loader } from "./loader.server";
import classNames from "classnames";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { ChatMarkdown } from "~/components/chat/ChatMarkdown";
import { Button, Icon, IconButton } from "@elpassion/taco";

export function BulkPage() {
  const { organizationId, pipelineId, apiUrl, pipeline } =
    useLoaderData<typeof loader>();

  const inputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_input",
  );

  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_output",
  );

  const [tests, setTests] = useState<
    {
      id: string;
      inputs: Record<string, string>;
      outputs: Record<string, string>;
      status: "pending" | "running" | "done";
    }[]
  >(() => [generateNewTest()]);

  function generateNewTest() {
    return {
      id: uuidv4(),
      status: "pending" as const,
      inputs: inputs.reduce(
        (acc, input) => ({ ...acc, [input.name]: " " }),
        {},
      ),
      outputs: outputs.reduce(
        (acc, output) => ({ ...acc, [output.name]: "" }),
        {},
      ),
    };
  }

  const handleOnSubmitTest = async (test: {
    id: string;
    inputs: Record<string, string>;
  }) => {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs`,
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
        },
      },
    );
    const {
      data: { id },
    } = await response.json();

    const runResponse = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/start`,
      {
        method: "POST",
        body: JSON.stringify({
          initial_inputs: Object.entries(test.inputs).map(([name, value]) => ({
            block_name: name,
            input_name: "input",
            data: value,
          })),
          wait_for_outputs: outputs.map((output) => ({
            block_name: output.name,
            output_name: "output",
          })),
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const data = await runResponse.json();

    const newOutputs = data.outputs.reduce(
      (acc: Record<string, string>, output: any) => ({
        ...acc,
        [output.block_name]: output.data,
      }),
      {},
    );

    setTests((tests) =>
      tests.map((t) =>
        t.id === test.id ? { ...t, outputs: newOutputs, status: "done" } : t,
      ),
    );

    await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/stop`,
      {
        method: "POST",
      },
    );
  };

  const handleOnSubmit = async (e: any) => {
    e.preventDefault();
    setTests((tests) => tests.map((t) => ({ ...t, status: "running" })));
    tests.map((test) => {
      handleOnSubmitTest(test);
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 md:justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-lg text-white font-medium">Bulk</h2>
          <p className="text-white text-xs">
            Run multiple workflows at once in parallel.
          </p>
        </div>

        <Button
          disabled={tests.some((test) => test.status === "running")}
          onClick={handleOnSubmit}
          className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
        >
          Run bulk
        </Button>
      </div>

      <table className="w-full">
        <thead className="text-left text-white text-xs bg-neutral-800">
          <tr className="rounded-xl overflow-hidden">
            {inputs.map((input) => (
              <th
                key={input.name}
                className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
              >
                {input.name}
              </th>
            ))}
            {outputs.map((output) => (
              <th
                key={output.name}
                className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
              >
                {output.name}
              </th>
            ))}
            <th className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg">
              {" "}
            </th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => {
            return (
              <tr
                key={test.id}
                className={classNames(
                  "[&:not(:first-child)]:border-t border-neutral-800 rounded-sm overflow-hidden",
                  {
                    "bg-primary-500": test.status === "running",
                    "bg-neutral-8800": test.status === "done",
                  },
                )}
                aria-label="pipeline run"
              >
                {inputs.map((input) => (
                  <td
                    key={input.name}
                    className="py-3 px-5 text-neutral-100 text-sm"
                  >
                    <TextareaInput
                      id={input.name}
                      key={input.name}
                      value={test.inputs[input.name]}
                      onChange={(e) => {
                        e.preventDefault();
                        const value = e.target.value;

                        setTests((tests) =>
                          tests.map((t) =>
                            test.id === t.id
                              ? {
                                  ...test,
                                  inputs: {
                                    ...test.inputs,
                                    [input.name]: value,
                                  },
                                }
                              : t,
                          ),
                        );
                      }}
                    />
                  </td>
                ))}
                {outputs.map((output) => (
                  <td
                    key={output.name}
                    className="py-3 px-5 text-neutral-100 text-sm"
                  >
                    <ChatMarkdown>{test.outputs[output.name]}</ChatMarkdown>
                  </td>
                ))}
                <td className="py-3 px-5 text-neutral-100 text-sm">
                  {tests.length > 1 ? (
                    <IconButton
                      size="xs"
                      variant="basic"
                      aria-label={`Remove item`}
                      className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4 ml-4"
                      title={`Remove item`}
                      icon={<Icon iconName="trash" />}
                      onClick={() =>
                        setTests((tests) =>
                          tests.filter(({ id }) => id !== test.id),
                        )
                      }
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <IconButton
        size="xs"
        variant="basic"
        aria-label={`Add item`}
        className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4 ml-4"
        title={`Add item`}
        icon={<Icon iconName="plus" />}
        onClick={() => setTests((tests) => tests.concat([generateNewTest()]))}
      />
      <div className="mt-20">
        <DocumentationCTA />
      </div>
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Client SDK",
    },
  ];
};
