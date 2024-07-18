import { useState, type Dispatch, type SetStateAction } from 'react';
import { Link } from '@remix-run/react';
import classNames from 'classnames';
import { ExternalLink, Trash } from 'lucide-react';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { SmallFileInput } from '~/components/form/inputs/file.input';
import { TextareaInput } from '~/components/form/inputs/textarea.input';
import { IconButton } from '~/components/iconButton';
import { routes } from '~/utils/routes.utils';

import type { ISelectedInput, ITest } from './page';

interface BulkTableProps {
  selectedInputs: ISelectedInput[];
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
  const [files, setFiles] = useState<Record<string, File>>({});
  const isTrashIconColumnVisible = tests.length > 1;
  const isRunLinkIconColumnVisible = tests.find((test) => test?.run);

  return (
    <table className="w-full table-auto">
      <thead className="text-left text-white text-xs bg-neutral-800">
        <tr className="rounded-xl overflow-hidden">
          {selectedInputs?.map((input: ISelectedInput) => (
            <th
              key={input.name}
              className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
            >
              {input.name}
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
                <td
                  key={input.name}
                  className="py-3 px-5 text-neutral-100 text-sm"
                >
                  {input.type === 'text_input' ? (
                    <TextareaInput
                      id={input.name}
                      key={input.name}
                      value={test.inputs[input.name]}
                      areaClassName="min-h-full !resize-y min-w-[120px]"
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
                  ) : (
                    <>
                      <SmallFileInput
                        multiple={false}
                        buttonText={input.name}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setFiles((prev) => ({
                            ...prev,
                            [input.name]: file,
                          }));
                        }}
                      />
                      <p>{files[input.name]?.name}</p>
                    </>
                  )}
                </td>
              ))}
              {selectedOutputs.map((output) => (
                <td
                  key={output}
                  className="py-3 px-5 text-neutral-100 text-sm"
                >
                  <ChatMarkdown>{test.outputs[output]}</ChatMarkdown>
                </td>
              ))}
              {isTrashIconColumnVisible && (
                <td className="w-7 py-3 text-neutral-100 text-sm">
                  <IconButton
                    size="xxs"
                    variant="secondary"
                    aria-label={`Remove item`}
                    className="!bg-neutral-700 !text-white !text-sm hover:!text-red-500 mt-4"
                    title={`Remove item`}
                    icon={<Trash />}
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
                      variant="secondary"
                      aria-label="Go to run overview"
                      icon={<ExternalLink />}
                      size="xxs"
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
