defmodule Buildel.Clients.OpenaiBehaviour do
  @type t :: %{
          token: String.t()
        }

  @type params :: %{
          model: String.t(),
          language: String.t(),
          endpoint: String.t(),
          filename: String.t()
        }

  @callback new(String.t()) :: t()
  @callback transcribe_audio(t(), {:binary, binary}, params()) ::
              {:ok, String.t()} | {:error, String.t()}
end

defmodule Buildel.Clients.Openai do
  alias Buildel.Clients.OpenaiBehaviour
  alias Multipart
  @behaviour Buildel.Clients.OpenaiBehaviour

  use Buildel.Clients.Utils.Srt
  use WebSockex

  defmodule TranscribeParams do
    defstruct [:model, :language, :endpoint, :filename]
  end

  defstruct [:token]

  @impl OpenaiBehaviour
  def new(token) do
    %__MODULE__{
      token: token
    }
  end

  @impl OpenaiBehaviour
  def transcribe_audio(%__MODULE__{token: token}, {:binary, audio}, %TranscribeParams{
        model: model,
        language: language,
        endpoint: endpoint,
        filename: filename
      }) do
    multipart =
      Multipart.new()
      |> Multipart.add_part(Multipart.Part.text_field(model, "model"))
      |> Multipart.add_part(Multipart.Part.text_field(language, "language"))
      |> Multipart.add_part(
        Multipart.Part.file_content_field(filename, audio, :file, filename: filename)
      )

    content_length = Multipart.content_length(multipart)
    content_type = Multipart.content_type(multipart, "multipart/form-data")

    headers = [
      {"Authorization", "Bearer #{token}"},
      {"Content-Type", content_type},
      {"Content-Length", to_string(content_length)}
    ]

    with {:ok, %{body: result, status: 200}} <-
           Req.post(endpoint,
             headers: headers,
             body: Multipart.body_stream(multipart)
           ) do
      %{"text" => text} = result
      {:ok, text}
    else
      {:ok, %{body: result}} ->
        {:error, result}

      {:error, error} ->
        {:error, error}
    end
  end
end
