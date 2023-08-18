'use client';

import React from 'react';
import z from 'zod';
import { Card } from '@elpassion/taco';
import { ENV } from '~/env.mjs';
import { ppush, useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

const IOType = z.object({ name: z.string(), type: z.enum(['audio', 'text']) });

const BlockType = z.object({
  type: z.string(),
  inputs: z.array(IOType),
  outputs: z.array(IOType),
  schema: z.string(),
});

const BlockTypes = z.array(BlockType);

const BlockTypesResponse = z.object({
  data: BlockTypes,
});

const Block = z.object({
  name: z.string(),
  forward_outputs: z.array(z.string()),
  opts: z.object({}),
  config: BlockType,
});

const BlocksResponse = z.object({
  blocks: z.array(Block),
});

type JSONSchemaField =
  | {
      type: 'object';
      properties: { [key: string]: JSONSchemaField };
      required?: string[];
    }
  | {
      type: 'string';
      title: string;
      description: string;
      minLength?: number;
    }
  | {
      type: 'number';
      title: string;
      description: string;
      minimum?: number;
      maximum?: number;
    }
  | {
      type: 'array';
      title: string;
      description: string;
      items: JSONSchemaField;
    };

export const ExampleClient = () => {
  const [{ channel }] = useBlocks();
  const [blocks, setBlocks] = React.useState<z.infer<typeof Block>[]>([]);
  const [blockTypes, setBlockTypes] = React.useState<
    z.infer<typeof BlockTypes>
  >([]);

  useEffectOnce(() => {
    const getBlockTypes = async () => {
      const response = await fetch(`${ENV.API_URL}/api/block_types`);
      const data = await response.json();
      const blockTypesResponse = BlockTypesResponse.parse(data);
      setBlockTypes(blockTypesResponse.data);
    };
    getBlockTypes();
  });

  const addBlock = async (blockType: string) => {
    channel?.push('add_block', {
      name: blockType,
      type: blockType,
      opts: {
        input: '',
        messages: [],
      },
      forward_outputs: [],
    });
    const blocks = await ppush(channel!, 'get_blocks', {});
    const validatedBlocks = BlocksResponse.parse(blocks);
    setBlocks(validatedBlocks.blocks);
  };

  function renderSchema(schema: string) {
    const schemaObj = JSON.parse(schema);
    return renderField(schemaObj, null, schemaObj);
  }

  function renderField(
    field: JSONSchemaField,
    key: string | null,
    schema: JSONSchemaField,
  ) {
    if (field.type === 'string') {
      return (
        <div>
          {field.title} - {field.description}
          <input name={key!} type="text" />
        </div>
      );
    } else if (field.type === 'number') {
      return (
        <div>
          {field.title} - {field.description}
          <input name={key!} type="number" />
        </div>
      );
    } else if (field.type === 'object') {
      return Object.entries(field.properties).map(([propertyKey, value]) => {
        const fieldKey = key === null ? propertyKey : `${key}.${propertyKey}`;
        return <div key={key}>{renderField(value, fieldKey, schema)}</div>;
      });
    } else if (field.type === 'array') {
      const fieldKey = key === null ? '0' : `${key}.0`;
      return (
        <div>
          {field.title} - {field.description}
          {renderField(field.items, fieldKey, schema)}
        </div>
      );
    }
    console.warn('Unknown field type', field);
    return null;
  }

  return (
    <>
      <div className="">
        Add block
        <div className="mb-4" />
        <div className="grid cursor-pointer grid-cols-4 gap-4">
          {blockTypes.map((blockType) => (
            <Card key={blockType.type} className="p-4 font-medium">
              {blockType.type.replaceAll('_', ' ').toUpperCase()}
            </Card>
          ))}
        </div>
        <div className="mb-12" />
        <div className="grid grid-cols-4 gap-4">
          {blocks.map((block, index: number) => {
            return (
              <div key={`${block.name}-${index}`}>
                {renderSchema(block.config.schema)}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
