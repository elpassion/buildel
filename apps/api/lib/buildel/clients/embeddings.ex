defmodule Buildel.Clients.Embeddings do
  alias __MODULE__
  @type t :: %Embeddings{}

  @enforce_keys [:api_type, :model, :api_key, :endpoint]
  defstruct [:api_type, :model, :api_key, :endpoint]

  @spec new(%{
          :api_key => String.t(),
          :api_type => String.t(),
          :model => String.t(),
          :endpoint => String.t()
        }) :: t()
  def new(%{api_type: api_type, model: model, api_key: api_key, endpoint: endpoint}) do
    %__MODULE__{api_type: api_type, model: model, api_key: api_key, endpoint: endpoint}
  end

  def get_embeddings(
        %__MODULE__{api_type: "openai", model: model, api_key: api_key, endpoint: endpoint},
        inputs
      ) do
    if inputs |> Enum.at(0) |> is_struct(Pgvector) do
      {:ok, %{embeddings: inputs |> Enum.map(&Pgvector.to_list/1), embeddings_tokens: 0}}
    else
      Buildel.Clients.OpenAIEmbeddings.get_embeddings(%{
        inputs: inputs,
        api_key: api_key,
        model: model,
        endpoint: endpoint
      })
    end
  end

  def get_embeddings(%__MODULE__{api_type: "test"}, inputs) do
    {:ok,
     %{
       embeddings: inputs |> Enum.map(fn _ -> Enum.map(1..1536, fn _ -> :rand.uniform() end) end),
       embeddings_tokens: 100
     }}
  end

  def get_config(%__MODULE__{api_type: "openai", model: model}) do
    Buildel.Clients.OpenAIEmbeddings.model_config(model)
  end

  def get_config(%__MODULE__{api_type: "test"}) do
    %{size: 100, distance: "cosine"}
  end
end

defmodule Buildel.Clients.EmbeddingsAdapterBehaviour do
  @type embeddings :: list(list(float()))

  @callback get_embeddings(%{inputs: [String.t()], model: String.t(), api_key: String.t()}) ::
              {:ok,
               %{
                 embeddings: embeddings(),
                 embeddings_tokens: integer()
               }}
  @callback model_config(String.t()) :: %{size: non_neg_integer, distance: String.t()}
end

defmodule Buildel.Clients.OpenAIEmbeddings do
  @behaviour Buildel.Clients.EmbeddingsAdapterBehaviour
  use Buildel.Utils.TelemetryWrapper

  @impl true
  def model_config("text-embedding-ada-002") do
    %{size: 1536, distance: "Cosine"}
  end

  @impl true
  def model_config("text-embedding-3-small") do
    %{size: 1536, distance: "Cosine"}
  end

  @impl true
  def model_config("text-embedding-3-large") do
    %{size: 3072, distance: "Cosine"}
  end

  @impl true
  deftimed get_embeddings(%{inputs: inputs, api_key: api_key, model: model, endpoint: endpoint}),
           [
             :buildel,
             :embeddings,
             :generation
           ] do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.post(
             endpoint,
             %{
               input: inputs,
               model: model
             }
             |> Jason.encode!(),
             [
               Authorization: "Bearer #{api_key}",
               "api-key": api_key,
               "content-type": "application/json"
             ],
             timeout: 60_000,
             recv_timeout: 60_000
           ),
         {:ok, body} <- Jason.decode(body) do
      {:ok,
       %{
         embeddings: body["data"] |> Enum.map(& &1["embedding"]),
         embeddings_tokens: body["usage"]["total_tokens"]
       }}
    else
      {:ok, %HTTPoison.Response{body: body}} ->
        case body |> Jason.decode!() do
          %{"error" => %{"code" => "invalid_api_key"}} -> {:error, :invalid_api_key}
          %{"error" => %{"code" => "insufficient_quota"}} -> {:error, :insufficient_quota}
          %{"error" => %{"code" => "model_not_found"}} -> {:error, :model_not_found}
        end
    end
  end

  def config(api_key \\ nil) do
    %OpenAI.Config{
      api_key: api_key,
      http_options: [
        timeout: 100_000,
        recv_timeout: 100_000
      ]
    }
  end
end

defmodule Buildel.Clients.BumblebeeEmbeddings do
  @behaviour Buildel.Clients.EmbeddingsAdapterBehaviour
  use Buildel.Utils.TelemetryWrapper

  @impl true
  deftimed get_embeddings(%{inputs: inputs}), [:buildel, :embeddings, :generation] do
    results =
      Nx.Serving.batched_run(__MODULE__, inputs)
      |> Enum.map(& &1[:embedding])
      |> Enum.map(&Nx.to_list/1)

    {:ok, results}
  end

  @impl true
  def model_config(_model) do
    %{size: 384, distance: "Dot"}
  end

  def serving() do
    {:ok, model_info} =
      Bumblebee.load_model({:hf, "sentence-transformers/all-MiniLM-L6-v2"})

    {:ok, tokenizer} =
      Bumblebee.load_tokenizer({:hf, "sentence-transformers/all-MiniLM-L6-v2"})

    Bumblebee.Text.TextEmbedding.text_embedding(model_info, tokenizer,
      compile: [batch_size: 32, sequence_length: [16, 32, 64, 128, 512]],
      defn_options: [compiler: EXLA]
    )
  end
end
