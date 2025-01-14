defmodule Buildel.Blocks.NewHuggingFaceImageClassification do
  use Buildel.Blocks.NewBlock
  import Buildel.Blocks.Utils.Schemas
  alias Buildel.Clients.Utils.Context

  defblock(:hf_image_classification,
    description:
      "This module triggers Hugging Face compatible inference endpoint for image classification.",
    groups: ["image"]
  )

  definput(:input, schema: %{}, type: :image)
  defoutput(:output, schema: %{})

  defoption(
    :api_key,
    secret_schema(%{
      "title" => "API Key",
      "description" => "Select from your API keys or enter a new one."
    })
  )

  defoption(:model, %{
    "type" => "string",
    "title" => "Model",
    "description" => "The model to use for the chat.",
    "default" => "microsoft/resnet-50"
  })

  def setup(state) do
    api_key = secret(state, option(state, :api_key))

    {:ok, state |> Map.put(:api_key, api_key)}
  end


  def handle_input(:input, %Message{metadata: %{method: :delete}} = message, state) do
    {:ok, state}
  end

  def handle_input(:input, %Message{message: chunk} = message, state) do
    send_stream_start(state, :output, message)

    case Buildel.Clients.HuggingFace.image_classification(option(state, :model), chunk.path, %{
           api_key: state.api_key
         }) do
      {:error, :unauthorized} ->
        result = Message.from_message(message)
                |> Message.set_type(:text)
                |> Message.set_message("Invalid API key provided")

        send_error(state, result)

        send_stream_stop(state, :output, result)
        {:error, "Invalid API key provided", state}
      {:ok, body} ->
        output(state, :output, message
                               |> Message.set_type(:text)
                               |> Message.set_message(Jason.encode!(body))
                               |> Message.set_metadata(message.metadata))

        {:ok, state}
      _ ->
        result = Message.from_message(message)
                 |> Message.set_type(:text)
                 |> Message.set_message("Something went wrong")

        send_error(state, result)

        send_stream_stop(state, :output, result)
        {:error, "Something went wrong", state}
    end
  end
end
