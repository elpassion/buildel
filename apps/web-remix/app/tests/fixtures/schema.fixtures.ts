import type { JSONSchemaStringField } from '~/components/form/schema/SchemaParser';

export const stringSchemaFixture = (
  args?: Partial<JSONSchemaStringField>,
): JSONSchemaStringField => {
  return {
    type: 'string',
    description:
      'The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.',
    title: 'Name',
    pattern: '^[^<>: ?-]*$',
    maxLength: 15,
    minLength: 2,
    regex: {
      pattern: '^[^<>: ?-]*$',
      errorMessage: "Invalid string. Characters '< > : - ? ' are not allowed.",
    },
    ...args,
  };
};

export const enumStringSchemaFixture = () => {
  return {
    default: 'openai',
    description: 'The type of the embeddings API.',
    enum: ['openai'],
    enumPresentAs: 'radio',
    title: 'API Type',
    type: 'string',
  };
};

export const numberSchemaFixture = () => {
  return {
    default: 0.7,
    description: 'The temperature of the chat.',
    maximum: 2,
    minimum: 0,
    step: 0.1,
    title: 'Temperature',
    type: 'number',
  };
};

export const booleanSchemaFixture = () => {
  return {
    description: 'The temperature of the chat.',
    title: 'Temperature',
    type: 'boolean',
  };
};

export const arraySchemaFixture = () => {
  return {
    description: 'The inputs to the block.',
    items: {
      description: 'The name of the input.',
      minLength: 2,
      title: 'Name',
      type: 'string',
    },
    minItems: 1,
    default: ['Hi'],
    title: 'Inputs',
    type: 'array',
  };
};

export const objectSchemaFixture = () => {
  return {
    description: 'The embeddings to use for the collection.',
    properties: {
      api_type: stringSchemaFixture(),
    },
    required: ['api_type'],
    title: 'Embeddings',
    type: 'object',
  };
};

export const sectionSchemaFixture = () => {
  return {
    description: 'The embeddings to use for the collection.',
    properties: {
      model: stringSchemaFixture(),
    },
    required: ['model'],
    title: 'Model',
    type: 'section',
  };
};

export const nestedObjectSchemaFixture = () => {
  return {
    description: 'The embeddings to use for the collection.',
    properties: {
      nested_object: objectSchemaFixture(),
    },
    required: ['nested_object'],
    title: 'Embeddings',
    type: 'object',
  };
};
