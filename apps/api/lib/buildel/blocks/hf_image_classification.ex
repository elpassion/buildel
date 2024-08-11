defmodule Buildel.Blocks.HuggingFaceImageClassification do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "hf_image_classification",
      description:
        "This module triggers Hugging Face compatible inference endpoint for image classification.",
      groups: ["image"],
      inputs: [Block.image_input("input")],
      outputs: [Block.text_output()],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  def setup(%{opts: opts, context_id: context_id} = state) do
    api_key =
      block_context().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    {:ok, state |> Map.put(:api_key, api_key)}
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
            "required" => [
              "model",
              "api_key"
            ],
            "properties" =>
              Jason.OrderedObject.new(
                api_key:
                  secret_schema(%{
                    "title" => "API Key",
                    "description" => "Select from your API keys or enter a new one."
                  }),
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The model to use for the chat.",
                  "default" => "microsoft/resnet-50"
                }
              )
          })
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :text, _file_id, %{method: :delete}}, state) do
    state
  end

  @impl true
  def handle_input("input", {_name, :binary, chunk, metadata}, state) do
    state = send_stream_start(state)

    case Buildel.Clients.HuggingFace.image_classification(state.opts.model, chunk, %{
           api_key: state.api_key
         }) do
      {:error, :unauthorized} -> send_error(state, "Invalid API key provided")
      {:ok, body} -> output(state, "output", {:text, Jason.encode!(body)}, %{metadata: metadata})
      _ -> send_error(state, "Something went wrong") |> send_stream_stop()
    end
  end
end
