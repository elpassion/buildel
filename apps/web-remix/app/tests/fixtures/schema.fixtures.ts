export const stringSchemaFixture = () => {
  return {
    type: "string",
    description:
      "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
    title: "Name",
    pattern: "^[^<>: ?-]*$",
    maxLength: 15,
    minLength: 2,
    regex: {
      pattern: "^[^<>: ?-]*$",
      errorMessage: "Invalid string. Characters '< > : - ? ' are not allowed.",
    },
  };
};

export const numberSchemaFixture = () => {
  return {
    default: 0.7,
    description: "The temperature of the chat.",
    maximum: 2,
    minimum: 0,
    step: 0.1,
    title: "Temperature",
    type: "number",
  };
};
