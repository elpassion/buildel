defmodule Buildel.Blocks.NewImage do
  use Buildel.Blocks.NewBlock
  use Buildel.Blocks.NewBlock.Image

  defblock(:image,
    description: "Block used to generate images. Can be used as a tool for chat",
    groups: ["image", "tools"]
  )

  definput(:input, schema: %{"type" => "string"})
  defoutput(:image_url, schema: %{"type" => "string"})

  defoption(:api_type, %{
    "type" => "string",
    "title" => "Model API type",
    "description" => "The API type to use for the chat.",
    "enum" => ["openai"],
    "enumPresentAs" => "radio",
    "default" => "openai",
    "readonly" => true
  })

  defoption(
    :api_key,
    Buildel.Blocks.Utils.Schemas.secret_schema(%{
      "title" => "API key",
      "description" => "API key to use for the chat.",
      "descriptionWhen" => %{
        "opts.api_type" => %{
          "openai" =>
            "[OpenAI API key](https://platform.openai.com/api-keys) to use for the chat."
        }
      },
      "defaultWhen" => %{
        "opts.api_type" => %{
          "openai" => "__openai",
          "azure" => "__azure",
          "google" => "__google",
          "mistral" => "__mistral",
          "anthropic" => "__anthropic"
        }
      }
    })
  )

  defoption(:endpoint, %{
    "type" => "string",
    "title" => "Endpoint",
    "description" => "The endpoint to use for the image generation.",
    "defaultWhen" => %{
      "opts.api_type" => %{
        "openai" => "https://api.openai.com/v1"
      }
    },
    "minLength" => 1
  })

  defoption(:model, %{
    "type" => "string",
    "title" => "Model",
    "description" => "The model to use for the image generation.",
    "url" =>
      "/api/organizations/{{organization_id}}/models?api_type={{opts.api_type}}&endpoint={{opts.endpoint}}&api_key={{opts.api_key}}",
    "presentAs" => "async-select",
    "minLength" => 1,
    "readonly" => true
  })

  defoption(:size, %{
    "type" => "string",
    "title" => "Size",
    "description" => "The size of image to generate.",
    "enum" => ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"],
    "enumPresentAs" => "radio",
    "default" => "256x256",
    "readonly" => true
  })

  defoption(:quality, %{
    "type" => "string",
    "title" => "Quality",
    "description" => "The quality of image to generate.",
    "enum" => ["standard", "hd"],
    "enumPresentAs" => "radio",
    "default" => "standard",
    "readonly" => true
  })

  defoption(:style, %{
    "type" => "string",
    "title" => "Style",
    "description" => "The style of image to generate.",
    "enum" => ["vivid", "natural"],
    "enumPresentAs" => "radio",
    "default" => "vivid",
    "readonly" => true
  })

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :image_url, message)

    with {:ok, image_url, state} <- generate_image(state, message) do
      output(
        state,
        :image_url,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message(image_url)
      )

      send_stream_stop(state, :image_url, message)
      {:ok, state}
    else
      {:error, error, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(error)
        )

        {:ok, state}
    end
  end

  defp generate_image(state, %Message{message: message}) do
    case image().generate_image(%{
           prompt: message,
           model: option(state, :model),
           api_type: option(state, :api_type),
           endpoint: option(state, :endpoint),
           api_key: secret(state, option(state, :api_key)),
           size: option(state, :size),
           quality: option(state, :quality),
           style: option(state, :style)
         }) do
      {:ok, result} ->
        {:ok, result.image_url, state}

      {:error, error} ->
        {:error, error, state}
    end
  end
end
