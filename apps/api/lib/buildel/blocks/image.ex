defmodule Buildel.Blocks.Image do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :generate

  @impl true
  def options() do
    %{
      type: "image",
      description: "Block used to generate images. Can be used as a tool for chat",
      groups: ["image", "tools"],
      inputs: [
        Block.text_input("input", false)
      ],
      outputs: [
        Block.image_output("output", false),
        Block.text_output("image_url", false)
      ],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_key", "api_type", "model", "endpoint", "size", "quality", "style"],
            "properties" =>
              Jason.OrderedObject.new(
                api_type: %{
                  "type" => "string",
                  "title" => "Model API type",
                  "description" => "The API type to use for the chat.",
                  "enum" => ["openai"],
                  "enumPresentAs" => "radio",
                  "default" => "openai",
                  "readonly" => true
                },
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => "API key to use for the image tool.",
                    "descriptionWhen" => %{
                      "opts.api_type" => %{
                        "openai" =>
                          "[OpenAI API key](https://platform.openai.com/api-keys) to use for the chat.",
                        "azure" => "Azure API key to use for the chat.",
                        "google" => "Google API key to use for the chat.",
                        "mistral" =>
                          "[Mistral API key](https://console.mistral.ai/api-keys/) to use for the chat.",
                        "anthropic" =>
                          "[Anthropic API key](https://www.anthropic.com/api) to use for the chat."
                      }
                    }
                  }),
                endpoint: %{
                  "type" => "string",
                  "title" => "Endpoint",
                  "description" => "The endpoint to use for the chat.",
                  "defaultWhen" => %{
                    "opts.api_type" => %{
                      "openai" => "https://api.openai.com/v1",
                      "azure" =>
                        "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_name}",
                      "google" => "https://generativelanguage.googleapis.com/v1beta/models",
                      "mistral" => "https://api.mistral.ai/v1",
                      "anthropic" => "https://api.anthropic.com/v1"
                    }
                  },
                  "minLength" => 1
                },
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The model to use for the image generation.",
                  "url" =>
                    "/api/organizations/{{organization_id}}/models?api_type={{opts.api_type}}&endpoint={{opts.endpoint}}&api_key={{opts.api_key}}",
                  "presentAs" => "async-select",
                  "minLength" => 1,
                  "readonly" => true
                },
                size: %{
                  "type" => "string",
                  "title" => "Size",
                  "description" => "The size of image to generate.",
                  "enum" => ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"],
                  "enumPresentAs" => "radio",
                  "default" => "256x256",
                  "readonly" => true
                },
                quality: %{
                  "type" => "string",
                  "title" => "Quality",
                  "description" => "The quality of image to generate.",
                  "enum" => ["standard", "hd"],
                  "enumPresentAs" => "radio",
                  "default" => "standard",
                  "readonly" => true
                },
                style: %{
                  "type" => "string",
                  "title" => "Style",
                  "description" => "The style of image to generate.",
                  "enum" => ["vivid", "natural"],
                  "enumPresentAs" => "radio",
                  "default" => "vivid",
                  "readonly" => true
                },
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "{{config.block_name}} Generate image 📑: \"{{config.args}}\"\n",
                    description: "How to format calling of api call through tool interface.",
                    displayWhen: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    },
                    minLength: 1
                  })
              )
          })
      }
    }
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "generate_image",
          description: "Generate image for a prompt.",
          parameters_schema: %{
            type: "object",
            properties: %{
              prompt: %{
                type: "string",
                description: "Prompt for the image to be generated"
              }
            },
            required: ["prompt"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.block.opts.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  # Client

  def generate(pid, {:text, _text, _metadata} = text) do
    GenServer.cast(pid, {:generate, text})
  end

  # Server

  @impl true
  def setup(%{type: __MODULE__, opts: opts, context_id: context_id} = state) do
    api_key = block_context().get_secret_from_context(context_id, opts.api_key)
    {:ok, state |> Map.put(:api_key, api_key)}
  end

  @impl true
  def handle_cast({:generate, {:text, prompt, _metadata}}, state) do
    state = state |> send_stream_start()

    state =
      case Buildel.Clients.Image.generate_image(%{
             prompt: prompt,
             model: state.opts.model,
             api_type: state.opts.api_type,
             endpoint: state.opts.endpoint,
             api_key: state.api_key,
             size: state.opts.size,
             quality: state.opts.quality,
             style: state.opts.style
           }) do
        {:ok, result} ->
          state
          |> output("output", {:binary, result.binary}, %{
            metadata: %{file_name: "image.png", file_type: "img/png"}
          })
          |> output("image_url", {:text, result.image_url})
          |> send_stream_stop()

        {:error, error} ->
          state |> send_stream_stop() |> send_error(error)
      end

    {:noreply, state}
  end

  @impl true
  def handle_tool("tool", "generate_image", {_topic, :text, args, _}, state) do
    state = state |> send_stream_start()

    case Buildel.Clients.Image.generate_image(%{
           prompt: args["prompt"],
           model: state.opts.model,
           api_type: state.opts.api_type,
           endpoint: state.opts.endpoint,
           api_key: state.api_key,
           size: state.opts.size,
           quality: state.opts.quality,
           style: state.opts.style
         }) do
      {:ok, result} ->
        state
        |> output("output", {:binary, result.binary}, %{
          metadata: %{file_name: "image.png", file_type: "img/png"}
        })
        |> output("image_url", {:text, result.image_url})
        |> send_stream_stop()

        {"Image URL: #{result.image_url}", state}

      {:error, error} ->
        state |> send_stream_stop() |> send_error(error)
        {"Error: #{error}. DO NOT TRY TO CREATE ANOTHER IMAGE.", state}
    end
  end

  @impl true
  def handle_input("input", {_name, :text, prompt, metadata}, state) do
    generate(self(), {:text, prompt, metadata})
    state
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
