defmodule Buildel.Clients.Image do
  alias Buildel.Clients.Image.ImageOpenAI

  def generate_image(opts) do
    client = get_client(opts)

    client
    |> do_generate_image(opts.prompt)
  end

  defp get_client(%{api_type: "openai"} = opts) do
    ImageOpenAI.new!(%{
      model: opts.model,
      api_key: opts.api_key,
      endpoint: opts.endpoint,
      size: opts.size,
      quality: opts.quality,
      style: opts.style
    })
  end

  defp do_generate_image(client, prompt) do
    %client_struct{} = client

    case client_struct.generate_image(client, prompt) do
      {:ok, %{image_url: image_url}} ->
        binary = Req.get!(image_url).body
        {:ok, path} = Temp.path(%{suffix: ".png"})
        :ok = File.write(path, binary)
        {:ok, %{image_url: image_url, binary: path}}

      {:error, error} ->
        {:error, error}
    end
  end

  defmodule ImageOpenAI do
    defstruct [:model, :api_key, :endpoint, :size, :quality, :style]

    def new!(opts) do
      %__MODULE__{
        model: opts.model,
        api_key: opts.api_key,
        endpoint: opts.endpoint,
        size: opts.size,
        quality: opts.quality,
        style: opts.style
      }
    end

    def generate_image(image_open_ai, prompt) do
      response =
        Req.new(url: image_open_ai.endpoint <> "/images/generations")
        |> Req.Request.put_header("Authorization", "Bearer #{image_open_ai.api_key}")
        |> Req.post(
          json: %{
            prompt: prompt,
            model: image_open_ai.model,
            size: image_open_ai.size,
            quality: image_open_ai.quality,
            style: image_open_ai.style
          }
        )

      case response do
        {:ok, %Req.Response{status: 200, body: %{"data" => [%{"url" => image_url}]}}} ->
          {:ok, %{image_url: image_url}}

        {:ok, %Req.Response{status: 400, body: %{"error" => %{"message" => message}}}} ->
          {:error, message}

        _ ->
          {:error, "Unknown error"}
      end
    end
  end
end
