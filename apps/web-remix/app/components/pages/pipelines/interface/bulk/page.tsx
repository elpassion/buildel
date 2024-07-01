import { useMemo, useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import { MetaFunction, useLoaderData } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { DocumentationCTA } from "~/components/interfaces/DocumentationCTA";
import { loader } from "./loader.server";
import classNames from "classnames";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { ChatMarkdown } from "~/components/chat/ChatMarkdown";
import { Button, Icon, IconButton } from "@elpassion/taco";
import { SmallFileInput } from "~/components/form/inputs/file.input";
import Papa from "papaparse";
import { Field } from "~/components/form/fields/field.context";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "./schema";
import { IBlockConfig } from "../../pipeline.types";
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from "~/components/interfaces/InterfaceSection";
import { SelectInput } from "~/components/form/inputs/select.input";
import { MultiValue } from "react-select";
import { IDropdownOption } from "@elpassion/taco/Dropdown";
import { ClientOnly } from "remix-utils/client-only";

export function BulkPage() {
  const { organizationId, pipelineId, pipeline } =
    useLoaderData<typeof loader>();

  const validator = useMemo(() => withZod(schema), []);
  const [selectedInputs, setSelectedInputs] = useState<
    MultiValue<IDropdownOption>
  >([]);
  const [selectedOutputs, setSelectedOutputs] = useState<
    MultiValue<IDropdownOption>
  >([]);

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
      inputs: selectedInputs.reduce(
        (acc, input) => ({ ...acc, [input.label]: " " }),
        {},
      ),
      outputs: selectedOutputs.reduce(
        (acc, output) => ({ ...acc, [output.label]: "" }),
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
          wait_for_outputs: selectedOutputs.map((output) => ({
            block_name: output.label,
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

  const exportCSV = () => {
    const testsWithFields = tests.map((test) => ({
      ...test.inputs,
      ...test.outputs,
    }));
    console.log(testsWithFields);
    const csv = Papa.unparse(testsWithFields, {});
    download(`${organizationId}-${pipelineId}-runs.csv`, csv);
  };

  function download(filename: string, text: string) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 md:justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-lg text-white font-medium">Bulk</h2>
          <p className="text-white text-xs">
            Run multiple workflows at once in parallel.
          </p>
        </div>

        <div className="flex ml-auto gap-2">
          <SmallFileInput
            multiple={false}
            buttonText="Add from CSV"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              Papa.parse(file, {
                header: true,
                complete: function (results) {
                  setTests(
                    results.data.map((result: any) => {
                      const test = generateNewTest();
                      const newInputs = Object.entries(test.inputs).reduce(
                        (inputs, [input, value]) => ({
                          ...inputs,
                          [input]: result[input] || value,
                        }),
                        {},
                      );
                      return { ...test, inputs: newInputs };
                    }),
                  );
                },
              });
            }}
          />

          <Button
            disabled={tests.some((test) => test.status !== "done")}
            onClick={exportCSV}
            className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
          >
            Export CSV
          </Button>

          <Button
            disabled={tests.some((test) => test.status === "running")}
            onClick={handleOnSubmit}
            className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
          >
            Run bulk
          </Button>
        </div>
      </div>

      <InterfaceSectionWrapper className="mb-8">
        <InterfaceSectionHeader>
          <InterfaceSectionHeading>Inputs and outputs</InterfaceSectionHeading>
          <InterfaceSectionHeaderParagraph>
            Select inputs and outputs for Bulk
          </InterfaceSectionHeaderParagraph>
        </InterfaceSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 min-h-[174px]">
          <ValidatedForm
            defaultValues={{
              inputs: pipeline.interface_config?.input,
              outputs: pipeline.interface_config?.output,
            }}
            validator={validator}
            noValidate
            onSubmit={handleOnSubmit}
          >
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 items-center max-w-screen-2xl">
              <Field name="inputs">
                <ClientOnly fallback={<div />}>
                  {() => (
                    <SelectInput
                      options={inputs.map(toSelectOption)}
                      label="Inputs"
                      isMulti
                      id="inputs"
                      onSelect={(selected: MultiValue<IDropdownOption>) => {
                        setSelectedInputs(selected);
                        setTests((tests) =>
                          tests.map((test) => ({
                            ...test,
                            inputs: selected.reduce(
                              (acc, input) => ({
                                ...acc,
                                [input.label]: "",
                              }),
                              {},
                            ),
                          })),
                        );
                      }}
                    />
                  )}
                </ClientOnly>
              </Field>

              <Field name="outputs">
                <ClientOnly fallback={<div />}>
                  {() => (
                    <SelectInput
                      options={outputs.map(toSelectOption)}
                      label="Outputs"
                      isMulti
                      id="outputs"
                      onSelect={(selected: MultiValue<IDropdownOption>) => {
                        setSelectedOutputs(selected);
                        setTests((tests) =>
                          tests.map((test) => ({
                            ...test,
                            outputs: selected.reduce(
                              (acc, output) => ({
                                ...acc,
                                [output.label]: "",
                              }),
                              {},
                            ),
                          })),
                        );
                      }}
                    />
                  )}
                </ClientOnly>
              </Field>
            </div>
          </ValidatedForm>
          {(selectedInputs.length > 0 || selectedOutputs.length > 0) && (
            <table className="w-full">
              <thead className="text-left text-white text-xs bg-neutral-800">
                <tr className="rounded-xl overflow-hidden">
                  {selectedInputs?.map((input: any) => (
                    <th
                      key={input.label}
                      className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
                    >
                      {input.label}
                    </th>
                  ))}
                  {selectedOutputs?.map((output: any) => (
                    <th
                      key={output.label}
                      className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
                    >
                      {output.label}
                    </th>
                  ))}
                  <th className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"></th>
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
                      {selectedInputs.map((input) => (
                        <td
                          key={input.label}
                          className="py-3 px-5 text-neutral-100 text-sm"
                        >
                          <TextareaInput
                            id={input.label}
                            key={input.label}
                            value={test.inputs[input.label]}
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
                                          [input.label]: value,
                                        },
                                      }
                                    : t,
                                ),
                              );
                            }}
                          />
                        </td>
                      ))}
                      {selectedOutputs.map((output) => (
                        <td
                          key={output.label}
                          className="py-3 px-5 text-neutral-100 text-sm"
                        >
                          <ChatMarkdown>
                            {test.outputs[output.label]}
                          </ChatMarkdown>
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
          )}
          {(selectedInputs.length > 0 || selectedOutputs.length > 0) && (
            <IconButton
              size="xs"
              variant="basic"
              aria-label={`Add item`}
              className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4 ml-4"
              title={`Add item`}
              icon={<Icon iconName="plus" />}
              onClick={() =>
                setTests((tests) => tests.concat([generateNewTest()]))
              }
            />
          )}
        </div>
      </InterfaceSectionWrapper>
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

function toSelectOption(item: IBlockConfig) {
  return {
    id: item.name.toString(),
    value: item.name.toString(),
    label: item.name,
  };
}
