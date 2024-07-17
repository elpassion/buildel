import { useMemo, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/react';
import { Icon, IconButton } from '@elpassion/taco';
import { withZod } from '@remix-validated-form/with-zod';
import Papa from 'papaparse';
import { ValidatedForm } from 'remix-validated-form';
import { v4 as uuidv4 } from 'uuid';

import { Field } from '~/components/form/fields/field.context';
import { SelectField } from '~/components/form/fields/select.field';
import { SmallFileInput } from '~/components/form/inputs/file.input';
import { DocumentationCTA } from '~/components/interfaces/DocumentationCTA';
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from '~/components/interfaces/InterfaceSection';
import { Button } from '~/components/ui/button';

import type { IBlockConfig } from '../../pipeline.types';
import { BulkTable } from './BulkTable';
import type { loader } from './loader.server';
import { schema } from './schema';

export interface ITest {
  id: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  status: 'pending' | 'running' | 'done';
  run?: number;
}

export interface ISelectedInput {
  name: string;
  type: string;
}

export function BulkPage() {
  const { organizationId, pipelineId, pipeline } =
    useLoaderData<typeof loader>();

  const validator = useMemo(() => withZod(schema), []);
  const [selectedInputs, setSelectedInputs] = useState<ISelectedInput[]>([]);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [tests, setTests] = useState<ITest[]>(() => [generateNewTest()]);
  const [summaryRunCost, setSummaryRunCost] = useState<
    { id: string; cost: number }[]
  >([]);

  const inputs = pipeline.config.blocks.filter(
    (block) => ['text_input', 'file_input'].includes(block.type),
  );

  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === 'text_output',
  );

  function generateNewTest() {
    return {
      id: uuidv4(),
      status: 'pending' as const,
      inputs: selectedInputs.reduce(
        (acc, input) => ({ ...acc, [input.name]: '' }),
        {},
      ),
      outputs: selectedOutputs.reduce(
        (acc, output) => ({ ...acc, [output]: '' }),
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
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const {
      data: { id },
    } = await response.json();

    setTests((tests) =>
      tests.map((t) => (t.id === test.id ? { ...t, run: id } : t)),
    );

    const runResponse = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/start`,
      {
        method: 'POST',
        body: JSON.stringify({
          initial_inputs: Object.entries(test.inputs).map(([name, value]) => ({
            block_name: name,
            input_name: 'input',
            data: value,
          })),
          wait_for_outputs: selectedOutputs.map((output) => ({
            block_name: output,
            output_name: 'output',
          })),
        }),
        headers: {
          'content-type': 'application/json',
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
        t.id === test.id ? { ...t, outputs: newOutputs, status: 'done' } : t,
      ),
    );

    const runStopResponse = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/stop`,
      {
        method: 'POST',
      },
    );

    const {
      data: { total_cost },
    } = await runStopResponse.json();

    setSummaryRunCost((prev) => [...prev, { id, cost: Number(total_cost) }]);
  };

  const handleOnSubmit = async (e: any) => {
    e.preventDefault();
    setTests((tests) => tests.map((t) => ({ ...t, status: 'running' })));
    tests.forEach((test) => {
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
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(text),
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const handleChangeNewSelectedInputs = (newSelected: ISelectedInput[]) => {
    setSelectedInputs(newSelected);
    setTests((tests) =>
      tests.map((test) => ({
        ...test,
        inputs: newSelected.reduce(
          (acc, input) => ({
            ...acc,
            [input.name]: '',
          }),
          {},
        ),
      })),
    );
  };
  const handleChangeNewSelectedOutputs = (newSelected: string[]) => {
    setSelectedOutputs(newSelected);
    setTests((tests) =>
      tests.map((test) => ({
        ...test,
        outputs: newSelected.reduce(
          (acc, output) => ({
            ...acc,
            [output]: '',
          }),
          {},
        ),
      })),
    );
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
            disabled={tests.some((test) => test.status !== 'done')}
            onClick={exportCSV}
            className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
          >
            Export CSV
          </Button>

          <Button
            disabled={tests.some((test) => test.status === 'running')}
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
            validator={validator}
            noValidate
            onSubmit={handleOnSubmit}
          >
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 items-center max-w-screen-2xl">
              <Field name="inputs">
                <SelectField
                  options={inputs.map(toSelectOption)}
                  label="Inputs"
                  mode="multiple"
                  onSelect={(selected: string) => {
                    const selectedType = inputs.find(
                      (input) => input.name === selected,
                    )?.type || "";

                    const newSelectedInputs = [
                      ...selectedInputs,
                      { name: selected, type: selectedType },
                    ];
                    handleChangeNewSelectedInputs(newSelectedInputs);
                  }}
                  onDeselect={(deselected: string) => {
                    const newSelectedInputs = selectedInputs.filter(
                      (item) => item.name !== deselected,
                    );
                    handleChangeNewSelectedInputs(newSelectedInputs);
                  }}
                />
              </Field>

              <Field name="outputs">
                <SelectField
                  options={outputs.map(toSelectOption)}
                  label="Outputs"
                  mode="multiple"
                  onSelect={(selected: string) => {
                    const newSelectedOutputs = [...selectedOutputs, selected];
                    handleChangeNewSelectedOutputs(newSelectedOutputs);
                  }}
                  onDeselect={(selected: string) => {
                    const newSelectedOutputs = selectedOutputs.filter(
                      (item) => item !== selected,
                    );
                    handleChangeNewSelectedOutputs(newSelectedOutputs);
                  }}
                />
              </Field>
            </div>
          </ValidatedForm>
          {(selectedInputs.length > 0 || selectedOutputs.length > 0) && (
            <>
              <p className="text-white">
                <span className="text-neutral-100">Summary cost ($): </span>
                {summaryRunCost.reduce((acc, runCost) => acc + runCost.cost, 0)}
              </p>
              <BulkTable
                selectedInputs={selectedInputs}
                selectedOutputs={selectedOutputs}
                tests={tests}
                setTests={setTests}
                organizationId={organizationId}
                pipelineId={pipelineId}
              />
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
            </>
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
      title: 'Client SDK',
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
