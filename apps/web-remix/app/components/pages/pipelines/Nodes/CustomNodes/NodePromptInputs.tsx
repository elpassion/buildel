import React, { useMemo } from 'react';
import { useEdges } from '@xyflow/react';

import type { IConfigConnection } from '~/components/pages/pipelines/pipeline.types';
import { cn } from '~/utils/cn';
import { isNotNil } from '~/utils/guards';

interface NodePromptInputsProps {
  className?: string;
  template?: string;
  blockName: string;
}

export const NodePromptInputs = ({
  className,
  template,
  blockName,
}: NodePromptInputsProps) => {
  const edges = useEdges();
  const promptTemplate = template ?? '';

  const connections = useMemo(() => {
    return edges
      .map((edge) => edge.data)
      .filter(isNotNil) as IConfigConnection[];
  }, [edges]);

  const inputs = useMemo(() => {
    return removeDuplicates(getInputsFromTemplate(promptTemplate)).map(
      splitInput,
    );
  }, [promptTemplate]);

  const notConnectedInputs = useMemo(() => {
    return inputs.filter((input) => {
      return !checkIfInputIsConnected(input, connections, blockName);
    });
  }, [inputs, edges]);

  if (inputs.length === 0) return null;

  return (
    <div className={cn('flex flex-col max-w-[350px]', className)}>
      <ul className="mt-1 flex gap-1 flex-wrap">
        {inputs.map(([block_name, output_name]) => (
          <li key={block_name + output_name}>
            <NodePromptInput
              isConnected={checkIfInputIsConnected(
                [block_name, output_name],
                connections,
                blockName,
              )}
            >
              {connectInput(block_name, output_name)}
            </NodePromptInput>
          </li>
        ))}
      </ul>

      {notConnectedInputs.length > 0 && (
        <div className="mt-2 py-1 px-2 rounded border border-yellow-500 bg-yellow-500/10 text-[10px] text-yellow-600">
          Node(s){' '}
          <span className="font-bold">
            {notConnectedInputs
              .map(([block_name, output_name]) =>
                connectInput(block_name, output_name),
              )
              .join(', ')}
          </span>{' '}
          used but not connected!
        </div>
      )}
    </div>
  );
};

function NodePromptInput({
  children,
  className,
  isConnected,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & { isConnected?: boolean }) {
  return (
    <p
      className={cn(
        'text-xs py-1 px-2 rounded',
        {
          'text-green-600 bg-green-500/10': isConnected,
          'bg-yellow-500/10 text-yellow-600': !isConnected,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

function getInputsFromTemplate(template: string) {
  return (template.match(/{{(.*?)}}/g) ?? []).map((input) =>
    input.replace(/{{|}}/g, ''),
  );
}

function removeDuplicates(arr: string[]) {
  return [...new Set(arr)];
}

function splitInput(input: string) {
  return input.split(':') as [string, string];
}

function connectInput(block_name: string, output_name: string) {
  if (output_name) {
    return `${block_name}:${output_name}`;
  }

  return block_name;
}

function checkIfInputIsConnected(
  input: [string, string],
  connections: IConfigConnection[],
  blockName: string,
) {
  if (input[0].includes('metadata') || input[0].includes('secrets')) {
    return true;
  }

  return checkInputConnection(input, connections, blockName);
}

function checkInputConnection(
  input: [string, string],
  connections: IConfigConnection[],
  blockName: string,
) {
  return connections.some((connection) => {
    return (
      (connection.from.block_name === input[0] &&
        connection.from.output_name === input[1] &&
        connection.to.block_name === blockName) ||
      (connection.to.block_name === input[0] &&
        connection.to.input_name === input[1] &&
        connection.from.block_name === blockName)
    );
  });
}
