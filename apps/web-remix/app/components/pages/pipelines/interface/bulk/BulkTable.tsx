import type { Dispatch, SetStateAction } from 'react';
import { Link } from '@remix-run/react';
import { Icon, IconButton } from '@elpassion/taco';
import classNames from 'classnames';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { TextareaInput } from '~/components/form/inputs/textarea.input';
import { routes } from '~/utils/routes.utils';

import type { ITest } from './page';

interface BulkTableProps {
  selectedInputs: string[];
  selectedOutputs: string[];
  tests: ITest[];
  setTests: Dispatch<SetStateAction<ITest[]>>;
  organizationId: string;
  pipelineId: string;
}

export const BulkTable: React.FC<BulkTableProps> = ({
  selectedInputs,
  selectedOutputs,
  tests,
  setTests,
  organizationId,
  pipelineId,
}) => {
  const isTrashIconColumnVisible = tests.length > 1;
  const isRunLinkIconColumnVisible = tests.find((test) => test?.run);

  return (
    <table className="w-full table-auto">
      <thead className="text-left text-white text-xs bg-neutral-800">
        <tr className="rounded-xl overflow-hidden">
          {selectedInputs?.map((input: string) => (
            <th
              key={input}
              className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
            >
              {input}
            </th>
          ))}
          {selectedOutputs?.map((output: string) => (
            <th
              key={output}
              className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
            >
              {output}
            </th>
          ))}
          {isTrashIconColumnVisible && (
            <th className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"></th>
          )}
          {isRunLinkIconColumnVisible && (
            <th className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"></th>
          )}
        </tr>
      </thead>
      <tbody>
        {tests.map((test) => {
          return (
            <tr
              key={test.id}
              className={classNames(
                '[&:not(:first-child)]:border-t border-neutral-800 rounded-sm overflow-hidden',
                {
                  'bg-primary-500': test.status === 'running',
                  'bg-neutral-8800': test.status === 'done',
                },
              )}
              aria-label="pipeline run"
            >
              {selectedInputs.map((input) => (
                <td key={input} className="py-3 px-5 text-neutral-100 text-sm">
                  <TextareaInput
                    id={input}
                    key={input}
                    value={test.inputs[input]}
                    areaClassName="min-h-full !resize-y"
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
                                  [input]: value,
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
                  key={output}
                  className="py-3 px-5 text-neutral-100 text-sm w-[40%]"
                >
                  <ChatMarkdown>{test.outputs[output]}</ChatMarkdown>
                </td>
              ))}
              {isTrashIconColumnVisible && (
                <td className="w-7 py-3 text-neutral-100 text-sm">
                  <IconButton
                    size="xs"
                    variant="basic"
                    aria-label={`Remove item`}
                    className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4"
                    title={`Remove item`}
                    icon={<Icon iconName="trash" />}
                    onClick={() =>
                      setTests((tests) =>
                        tests.filter(({ id }) => id !== test.id),
                      )
                    }
                  />
                </td>
              )}
              {test?.run && (
                <td className="w-7 py-3">
                  <Link
                    id={`run-link-${test.run}`}
                    to={routes.pipelineRun(
                      organizationId,
                      pipelineId,
                      test.run,
                    )}
                  >
                    <IconButton
                      className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4"
                      variant="basic"
                      aria-label="Go to run overview"
                      icon={<Icon iconName="external-link" />}
                      size="xs"
                    />
                  </Link>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
