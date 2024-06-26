import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DocumentationCTA } from "~/components/interfaces/DocumentationCTA";
import { loader } from "./loader.server";

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
    }[]
  >(() => [generateNewTest()]);

  function generateNewTest() {
    return {
      id: uuidv4(),
      inputs: inputs.reduce((acc, input) => ({ ...acc, [input.name]: "" }), {}),
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
      tests.map((t) => (t.id === test.id ? { ...t, outputs: newOutputs } : t)),
    );
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
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

        <button
          onClick={handleOnSubmit}
          className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
        >
          Run bulk
        </button>
      </div>

      <div className="text-white">
        <div className="border-1 p-2 flex justify-between">
          {inputs.map((input) => (
            <div key={input.name}>{input.name}</div>
          ))}
          {outputs.map((output) => (
            <div key={output.name}>{output.name}</div>
          ))}
        </div>
        {tests.map((test) => {
          return (
            <div className="border-1 p-2 flex justify-between" key={test.id}>
              {inputs.map((input) => (
                <input
                  className="text-black"
                  key={input.name}
                  value={test.inputs[input.name]}
                  onChange={(e) => {
                    e.preventDefault();
                    const value = e.target.value;

                    setTests((tests) => {
                      return tests.map((t) =>
                        test.id === t.id
                          ? {
                              ...test,
                              inputs: { ...test.inputs, [input.name]: value },
                            }
                          : t,
                      );
                    });
                  }}
                />
              ))}
              {outputs.map((output) => test.outputs[output.name])}
              {tests.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setTests((tests) =>
                      tests.filter(({ id }) => id !== test.id),
                    )
                  }
                >
                  -
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          onClick={() => setTests((tests) => tests.concat([generateNewTest()]))}
        >
          +
        </button>
      </div>

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
