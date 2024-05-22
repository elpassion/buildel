import { IBlockTypes } from "~/api/blockType/blockType.contracts";

export const blockTypesFixture = (blocks: IBlockTypes = []): IBlockTypes => {
  return [
    {
      type: "api_call_tool",
      description: "Tool used to call HTTP APIs.",
      groups: ["text", "tools"],
      inputs: [
        {
          name: "args",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "response",
          type: "text",
          public: false,
        },
      ],
      ios: [
        {
          name: "tool",
          type: "worker",
          public: false,
        },
      ],
      schema: {
        properties: {
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["method", "url", "description", "parameters", "headers"],
            properties: {
              method: {
                default: "GET",
                description: "The HTTP method to use for the request.",
                enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                enumPresentAs: "radio",
                title: "Method",
                type: "string",
              },
              url: {
                description:
                  "The URL to send the request to. If you want to use a variable, use {{variable_name}}. Notice the double curly braces!",
                title: "URL",
                type: "string",
              },
              description: {
                description: "The description of the API call.",
                title: "Description",
                type: "string",
              },
              parameters: {
                default: '{"type": "object", "properties": {}, "required": []}',
                description:
                  'Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. ie. {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}.',
                editorLanguage: "json",
                presentAs: "editor",
                title: "Parameters",
                type: "string",
              },
              headers: {
                default:
                  '{"Content-Type": "application/json", "Accept": "application/json"}',
                description:
                  'Valid JSON object of the headers to be sent with the request. ie. {"Content-Type": "application/json"}.',
                editorLanguage: "json",
                presentAs: "editor",
                title: "Headers",
                type: "string",
              },
              authorize: {
                default: false,
                description:
                  "Whether to authorize the request with organization secret.",
                title: "Authorize",
                type: "boolean",
              },
            },
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "audio_input",
      description:
        "A specialized block designed for capturing and streaming audio data.",
      groups: ["audio", "inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "audio",
          public: true,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "audio",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "audio_output",
      description:
        "It's designed to work seamlessly with other audio-related blocks in Buildel, ensuring smooth and flexible audio output capabilities in applications.",
      groups: ["audio", "inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "audio",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "audio",
          public: true,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "chat",
      description:
        "Large Language Model chat block enabling advanced conversational interactions powered by OpenAI's cutting-edge language models.",
      groups: ["text", "llms"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
        {
          name: "message_output",
          type: "text",
          public: false,
        },
      ],
      ios: [
        {
          name: "tool",
          type: "controller",
          public: false,
        },
        {
          name: "chat",
          type: "worker",
          public: false,
        },
      ],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [
              "description",
              "model",
              "chat_memory_type",
              "temperature",
              "system_message",
              "messages",
              "api_key",
              "endpoint",
              "api_type",
            ],
            properties: {
              description: {
                description: "The description of the chat.",
                title: "Description",
                type: "string",
              },
              api_key: {
                description: "OpenAI API key to use for the chat.",
                minLength: 1,
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    name: {
                      description: "The name for the secret.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    value: {
                      description: "The value of the secret.",
                      minLength: 1,
                      presentAs: "password",
                      title: "Value",
                      type: "string",
                    },
                  },
                  required: ["name", "value"],
                  type: "object",
                },
                title: "API key",
                type: "string",
                url: "/api/organizations/{{organization_id}}/secrets",
              },
              api_type: {
                default: "openai",
                description: "The API type to use for the chat.",
                enum: ["openai", "azure", "google", "mistral"],
                enumPresentAs: "radio",
                title: "Model API type",
                type: "string",
              },
              model: {
                description: "The model to use for the chat.",
                presentAs: "async-select",
                title: "Model",
                type: "string",
                url: "/api/organizations/{{organization_id}}/models?api_type={{opts.api_type}}",
              },
              endpoint: {
                defaultWhen: {
                  "opts.api_type": {
                    azure:
                      "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_name}",
                    google:
                      "https://generativelanguage.googleapis.com/v1beta/models",
                    mistral: "https://api.mistral.ai/v1",
                    openai: "https://api.openai.com/v1",
                  },
                },
                description: "The endpoint to use for the chat.",
                title: "Endpoint",
                type: "string",
              },
              chat_memory_type: {
                default: "full",
                description: "The chat memory type to use for the chat.",
                enum: ["off", "full", "rolling"],
                enumPresentAs: "radio",
                title: "Chat memory type",
                type: "string",
              },
              temperature: {
                default: 0.7,
                description: "The temperature of the chat.",
                maximum: 2,
                minimum: 0,
                step: 0.1,
                title: "Temperature",
                type: "number",
              },
              system_message: {
                description: "The message to start the conversation with.",
                editorLanguage: "custom",
                minLength: 1,
                presentAs: "editor",
                title: "System message",
                type: "string",
              },
              messages: {
                default: [],
                description: "The messages to start the conversation with.",
                items: {
                  properties: {
                    content: {
                      editorLanguage: "custom",
                      presentAs: "editor",
                      title: "Content",
                      type: "string",
                    },
                    role: {
                      default: "user",
                      enum: ["user", "assistant"],
                      enumPresentAs: "radio",
                      title: "Role",
                      type: "string",
                    },
                  },
                  required: ["role", "content"],
                  type: "object",
                },
                minItems: 0,
                title: "Messages",
                type: "array",
              },
              prompt_template: {
                description: "The template to use for the prompt.",
                minLength: 1,
                presentAs: "editor",
                title: "Prompt template",
                type: "string",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "collect_all_text",
      description:
        "This module specializes in accumulating and consolidating text input from streaming sources.",
      groups: ["text", "utils"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "collect_sentences",
      description:
        "This module segmenting and extracting individual sentences from continuous text streams.",
      groups: ["text", "utils"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "sentences_output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "create_block_tool",
      description: "Used to create block in workflow abc",
      groups: ["el", "tools"],
      inputs: [
        {
          name: "organization_id",
          type: "text",
          public: false,
        },
        {
          name: "pipeline_id",
          type: "text",
          public: false,
        },
      ],
      outputs: [],
      ios: [
        {
          name: "tool",
          type: "worker",
          public: false,
        },
      ],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "document_search",
      description:
        "Used for efficient searching and retrieval of information from a collection of documents inside Buildel Knowledge Base.",
      groups: ["file", "memory"],
      inputs: [
        {
          name: "files",
          type: "file",
          public: true,
        },
        {
          name: "query",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
      ],
      ios: [
        {
          name: "tool",
          type: "worker",
          public: false,
        },
      ],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["knowledge", "limit", "similarity_threshhold"],
            properties: {
              knowledge: {
                description: "The knowledge to use for retrieval.",
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    collection_name: {
                      description: "The name for collection.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    embeddings: {
                      description: "The embeddings to use for the collection.",
                      properties: {
                        api_type: {
                          default: "openai",
                          description: "The type of the embeddings API.",
                          enum: ["openai"],
                          enumPresentAs: "radio",
                          title: "API Type",
                          type: "string",
                        },
                        model: {
                          description: "The model to use for the embeddings.",
                          presentAs: "async-select",
                          title: "Model",
                          type: "string",
                          url: "/api/organizations/{{organization_id}}/models/embeddings?api_type={{embeddings.api_type}}",
                        },
                        secret_name: {
                          description: "The secret to use for the embeddings.",
                          minLength: 1,
                          presentAs: "async-creatable-select",
                          schema: {
                            properties: {
                              name: {
                                description: "The name for the secret.",
                                minLength: 1,
                                title: "Name",
                                type: "string",
                              },
                              value: {
                                description: "The value of the secret.",
                                minLength: 1,
                                presentAs: "password",
                                title: "Value",
                                type: "string",
                              },
                            },
                            required: ["name", "value"],
                            type: "object",
                          },
                          title: "Embeddings Secret",
                          type: "string",
                          url: "/api/organizations/{{organization_id}}/secrets",
                        },
                      },
                      required: ["api_type", "model", "secret_name"],
                      title: "Embeddings",
                      type: "object",
                    },
                  },
                  required: ["collection_name"],
                  type: "object",
                },
                title: "Knowledge",
                type: "string",
                url: "/api/organizations/{{organization_id}}/memory_collections",
              },
              limit: {
                default: 3,
                description: "The maximum number of results to return.",
                title: "Limit",
                type: "number",
              },
              similarity_threshhold: {
                default: 0.75,
                description: "The similarity threshhold to use for the search.",
                maximum: 1,
                minimum: 0,
                step: 0.01,
                title: "Similarity threshhold",
                type: "number",
              },
            },
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "document_tool",
      description:
        "It's a powerful tool for applications requiring quick and precise access to specific documents stored in Buildel's knowledge bases.",
      groups: ["text", "tools"],
      inputs: [],
      outputs: [],
      ios: [
        {
          name: "tool",
          type: "worker",
          public: false,
        },
      ],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["knowledge"],
            properties: {
              knowledge: {
                description: "The knowledge to use for retrieval.",
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    collection_name: {
                      description: "The name for collection.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    embeddings: {
                      description: "The embeddings to use for the collection.",
                      properties: {
                        api_type: {
                          default: "openai",
                          description: "The type of the embeddings API.",
                          enum: ["openai"],
                          enumPresentAs: "radio",
                          title: "API Type",
                          type: "string",
                        },
                        model: {
                          description: "The model to use for the embeddings.",
                          presentAs: "async-select",
                          title: "Model",
                          type: "string",
                          url: "/api/organizations/{{organization_id}}/models/embeddings?api_type={{embeddings.api_type}}",
                        },
                        secret_name: {
                          description: "The secret to use for the embeddings.",
                          minLength: 1,
                          presentAs: "async-creatable-select",
                          schema: {
                            properties: {
                              name: {
                                description: "The name for the secret.",
                                minLength: 1,
                                title: "Name",
                                type: "string",
                              },
                              value: {
                                description: "The value of the secret.",
                                minLength: 1,
                                presentAs: "password",
                                title: "Value",
                                type: "string",
                              },
                            },
                            required: ["name", "value"],
                            type: "object",
                          },
                          title: "Embeddings Secret",
                          type: "string",
                          url: "/api/organizations/{{organization_id}}/secrets",
                        },
                      },
                      required: ["api_type", "model", "secret_name"],
                      title: "Embeddings",
                      type: "object",
                    },
                  },
                  required: ["collection_name"],
                  type: "object",
                },
                title: "Knowledge",
                type: "string",
                url: "/api/organizations/{{organization_id}}/memory_collections",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "file_input",
      description:
        "A streamlined module designed for the efficient handling and transmission of file data.",
      groups: ["file", "inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "file",
          public: true,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "file",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {},
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "file_speech_to_text",
      description:
        "This module expertly transcribes audio content into text, offering multiple output formats including plain text, JSON, and SRT.",
      groups: ["audio", "text"],
      inputs: [
        {
          name: "input",
          type: "audio",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
        {
          name: "json_output",
          type: "text",
          public: false,
        },
        {
          name: "srt_output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["api_key"],
            properties: {
              timeout: {
                default: 10000,
                description:
                  "The temperature specifies the maximum duration (in ms.) for an operation to complete before the system terminates it due to inactivity or delay.",
                minimum: 0,
                title: "Stop after (ms)",
                type: "number",
              },
              language: {
                default: "en",
                description: "Language of the transcription.",
                enum: ["en", "pl", "es"],
                enumPresentAs: "radio",
                title: "Language",
                type: "string",
              },
              model: {
                default: "base",
                description:
                  "Model allows you to supply a model to use to process submitted audio.",
                enum: ["base", "enhanced"],
                enumPresentAs: "radio",
                title: "Model",
                type: "string",
              },
              api_key: {
                description: "Deepgram API key",
                minLength: 1,
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    name: {
                      description: "The name for the secret.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    value: {
                      description: "The value of the secret.",
                      minLength: 1,
                      presentAs: "password",
                      title: "Value",
                      type: "string",
                    },
                  },
                  required: ["name", "value"],
                  type: "object",
                },
                title: "API key",
                type: "string",
                url: "/api/organizations/{{organization_id}}/secrets",
              },
            },
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "hugging_face_chat",
      description:
        "This module integrates advanced Hugging Face language models to provide dynamic and intelligent chat functionalities.",
      groups: ["text", "llms"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
        {
          name: "message_output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [
              "model",
              "temperature",
              "system_message",
              "messages",
              "api_key",
              "stream",
            ],
            properties: {
              api_key: {
                description: "Select from your API keys or enter a new one.",
                minLength: 1,
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    name: {
                      description: "The name for the secret.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    value: {
                      description: "The value of the secret.",
                      minLength: 1,
                      presentAs: "password",
                      title: "Value",
                      type: "string",
                    },
                  },
                  required: ["name", "value"],
                  type: "object",
                },
                title: "API Key",
                type: "string",
                url: "/api/organizations/{{organization_id}}/secrets",
              },
              model: {
                default: "gpt-2",
                description: "The model to use for the chat.",
                title: "Model",
                type: "string",
              },
              stream: {
                default: false,
                description: "Whether to stream the chat.",
                title: "Stream",
                type: "boolean",
              },
              temperature: {
                default: 0.7,
                description: "The temperature of the chat.",
                maximum: 2,
                minimum: 0,
                step: 0.1,
                title: "Temperature",
                type: "number",
              },
              system_message: {
                description: "The message to start the conversation with.",
                minLength: 1,
                presentAs: "editor",
                title: "System message",
                type: "string",
              },
              messages: {
                default: [],
                description: "The messages to start the conversation with.",
                items: {
                  properties: {
                    content: {
                      presentAs: "editor",
                      title: "Content",
                      type: "string",
                    },
                    role: {
                      default: "user",
                      enum: ["user", "assistant"],
                      enumPresentAs: "radio",
                      title: "Role",
                      type: "string",
                    },
                  },
                  required: ["role", "content"],
                  type: "object",
                },
                minItems: 0,
                title: "Messages",
                type: "array",
              },
              prompt_template: {
                description: "The template to use for the prompt.",
                minLength: 1,
                presentAs: "editor",
                title: "Prompt template",
                type: "string",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "if",
      description:
        "Use this block to compare the input to a condition and forward the input to the true or false output",
      groups: ["utils"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "true",
          type: "text",
          public: false,
        },
        {
          name: "false",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["condition"],
            properties: {
              condition: {
                description: "The value to compare the input to",
                minLength: 1,
                title: "Condition",
                type: "string",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "map_inputs",
      description:
        "Used to map the latest inputs and combine them based on a specified template.",
      groups: ["text", "utils"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["template"],
            properties: {
              template: {
                description: "Output string from combined inputs.",
                minLength: 1,
                title: "Template",
                type: "string",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "speech_to_text",
      description:
        "This module is adept at transcribing audio data into text, offering outputs in both plain text and JSON formats.",
      groups: ["audio", "text"],
      inputs: [
        {
          name: "input",
          type: "audio",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
        {
          name: "json_output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["api_key"],
            properties: {
              timeout: {
                default: 10000,
                description:
                  "The temperature specifies the maximum duration (in ms.) for an operation to complete before the system terminates it due to inactivity or delay.",
                minimum: 0,
                title: "Stop after (ms)",
                type: "number",
              },
              language: {
                default: "en",
                description: "Language of the transcription.",
                enum: ["en", "pl", "es"],
                enumPresentAs: "radio",
                title: "Language",
                type: "string",
              },
              model: {
                default: "base",
                description:
                  "Model allows you to supply a model to use to process submitted audio.",
                enum: ["base", "enhanced"],
                enumPresentAs: "radio",
                title: "Model",
                type: "string",
              },
              api_key: {
                description: "Deepgram API key",
                minLength: 1,
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    name: {
                      description: "The name for the secret.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    value: {
                      description: "The value of the secret.",
                      minLength: 1,
                      presentAs: "password",
                      title: "Value",
                      type: "string",
                    },
                  },
                  required: ["name", "value"],
                  type: "object",
                },
                title: "API key",
                type: "string",
                url: "/api/organizations/{{organization_id}}/secrets",
              },
            },
          },
        },
        required: ["name", "opts"],
        type: "object",
      },
    },
    {
      type: "split_text",
      description:
        "It's an essential utility for processing large texts, enabling efficient text handling and manipulation in Buildel applications.",
      groups: ["utils", "text"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["condition"],
            properties: {
              chunk_size: {
                default: 500,
                description: "The value to compare the input to",
                minimum: 0,
                title: "Chunk size",
                type: "number",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "text_input",
      description:
        "This module is crafted for the seamless intake and transmission of textual data.",
      groups: ["text", "inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: true,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: [],
            properties: {
              pull: {
                default: false,
                description: "pull",
                title: "Pull",
                type: "boolean",
              },
            },
          },
        },
        required: ["name", "opts", "inputs"],
        type: "object",
      },
    },
    {
      type: "text_output",
      description: "A versatile module designed to output text data.",
      groups: ["text", "inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "text",
          public: true,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["stream_timeout"],
            properties: {
              stream_timeout: {
                default: 500,
                description:
                  "Wait this many milliseconds after receiving the last chunk before stopping the stream.",
                minimum: 500,
                step: 1,
                title: "Stop after (ms)",
                type: "number",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "text_to_speech",
      description:
        "This module enables seamless conversion of textual data into audio format, leveraging the ElevenLabs API",
      groups: ["text", "audio"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [
        {
          name: "output",
          type: "audio",
          public: false,
        },
      ],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["api_key"],
            properties: {
              api_key: {
                description: "ElevenLabs API Key.",
                minLength: 1,
                presentAs: "async-creatable-select",
                schema: {
                  properties: {
                    name: {
                      description: "The name for the secret.",
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                    value: {
                      description: "The value of the secret.",
                      minLength: 1,
                      presentAs: "password",
                      title: "Value",
                      type: "string",
                    },
                  },
                  required: ["name", "value"],
                  type: "object",
                },
                title: "API key",
                type: "string",
                url: "/api/organizations/{{organization_id}}/secrets",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    {
      type: "webhook_output",
      description:
        "This module is adept at forwarding text data to specified webhook URLs, facilitating seamless external integrations.",
      groups: ["inputs / outputs"],
      inputs: [
        {
          name: "input",
          type: "text",
          public: false,
        },
      ],
      outputs: [],
      ios: [],
      schema: {
        properties: {
          inputs: {
            description: "The inputs to the block.",
            items: {
              description: "The name of the input.",
              minLength: 2,
              title: "Name",
              type: "string",
            },
            minItems: 0,
            title: "Inputs",
            type: "array",
          },
          name: {
            type: "string",
            description:
              "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
            title: "Name",
            pattern: "^[^<>: ?-]*$",
            minLength: 2,
            maxLength: 30,
            regex: {
              pattern: "^[^<>: ?-]*$",
              errorMessage:
                "Invalid string. Characters '< > : - ? ' are not allowed.",
            },
          },
          opts: {
            type: "object",
            description: "Additional options for the block.",
            title: "Options",
            required: ["url"],
            properties: {
              url: {
                description: "URL to which the block will send data.",
                title: "Webhook url",
                type: "string",
              },
            },
          },
        },
        required: ["name", "inputs", "opts"],
        type: "object",
      },
    },
    ...blocks,
  ];
};
