defmodule Buildel.DocumentWorkflow.DocumentLoader do
  alias __MODULE__

  @type t :: %DocumentLoader{
          adapter: Buildel.DocumentWorkflow.DocumentLoaderBehaviour.t()
        }

  @enforce_keys [:adapter]
  defstruct [:adapter]

  @spec new(%{adapter: Buildel.DocumentWorkflow.DocumentLoaderBehaviour.t()}) :: t()
  def new(%{adapter: adapter}) do
    %__MODULE__{adapter: adapter}
  end
end

defmodule Buildel.DocumentWorkflow.DocumentLoaderBehaviour do
  @callback request(String.t(), map()) :: {:ok, binary()}
end

defmodule Buildel.DocumentWorkflow.DocumentLoaderTestAdapter do
  @behaviour Buildel.DocumentWorkflow.DocumentLoaderBehaviour

  @impl true
  def request(_, _) do
    {:ok, file_json} = File.read("./test/buildel/document_workflow/response_short.json")
    {:ok, file_json |> Jason.decode!()}
  end
end

defmodule Buildel.DocumentWorkflow.DocumentLoaderAdapter do
  @behaviour Buildel.DocumentWorkflow.DocumentLoaderBehaviour
  require Logger

  @impl true
  def request(path, _file_metadata) do
    filename = Path.basename(path)
    {:ok, file_contents} = File.read(path)

    multipart =
      Multipart.new()
      |> Multipart.add_part(
        Multipart.Part.file_content_field(filename, file_contents, :file, filename: filename)
      )

    content_length = Multipart.content_length(multipart)
    content_type = Multipart.content_type(multipart, "multipart/form-data")

    headers = [
      {"Content-Type", content_type},
      {"Content-Length", to_string(content_length)}
    ]

    with {:ok, %{body: result, status: 200}} <-
           [
             base_url:
               "#{Application.fetch_env!(:buildel, :nlm_api_url)}/api/parseDocument?applyOcr=yes",
             headers: headers,
             body: Multipart.body_stream(multipart),
             connect_options: [
               timeout: 60_000 * 5,
               protocols: [:http1]
             ],
             receive_timeout: 60_000 * 5
           ]
           |> Req.post() do
      {:ok, result}
    else
      error ->
        Logger.error(inspect(error))
        :error
    end
  end
end
