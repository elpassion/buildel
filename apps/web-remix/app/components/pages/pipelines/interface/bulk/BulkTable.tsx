import { useState, type Dispatch, type SetStateAction } from 'react';
import { Link } from '@remix-run/react';
import { ExternalLink, Trash } from 'lucide-react';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { SmallFileInput } from '~/components/form/inputs/file.input';
import { TextareaInput } from '~/components/form/inputs/textarea.input';
import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';
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
      <thead className="text-left text-muted-foreground text-xs bg-muted">
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
              className={cn(
                '[&:not(:first-child)]:border-t border-input rounded-sm overflow-hidden',
                {
                  'bg-orange-500': test.status === 'running',
                  'bg-muted': test.status === 'done',
                },
              )}
              aria-label="pipeline run"
            >
              {selectedInputs.map((input) => (
                <td
                  key={input.name}
                  className="py-3 px-5 text-muted-foreground text-sm"
                >
                  {input.type === 'text_input' ? (
                    <TextareaInput
                      id={input.name}
                      key={input.name}
                      value={test.inputs[input.name]}
                      className="min-h-full !resize-y min-w-[120px]"
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
                  className="py-3 px-5 text-muted-foreground text-sm"
                >
                  <ChatMarkdown>{test.outputs[output]}</ChatMarkdown>
                </td>
              ))}
              {isTrashIconColumnVisible && (
                <td className="w-7 py-3 text-muted-foreground text-sm">
                  <IconButton
                    size="xxs"
                    variant="secondary"
                    aria-label={`Remove item`}
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
                      variant="outline"
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
