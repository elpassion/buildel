defmodule Buildel.Clients.Cohere do
  require Logger
  @enforce_keys [:api_key]
  defstruct [:api_key]

  @type t :: %__MODULE__{api_key: String.t()}

  @spec new(String.t()) :: t
  def new(api_key) do
    %__MODULE__{api_key: api_key}
  end

  @type rerank_response ::
          {:ok,
           %{
             results: list(%{index: integer(), relevance_score: float()}),
             id: String.t(),
             meta: %{
               api_version: %{
                 version: String.t()
               },
               billed_units: %{
                 search_units: String.t()
               }
             }
           }}
          | {:error, term() | String.t()}

  @spec rerank(t, %{
          documents: list(String.t()),
          model: String.t(),
          query: String.t(),
          top_n: integer
        }) :: rerank_response()
  def rerank(client, %{documents: documents, model: model, query: query, top_n: top_n}) do
    case Req.new(url: "https://api.cohere.com/v1/rerank", decode_json: [keys: :atoms])
         |> Req.Request.put_header("Authorization", "bearer #{client.api_key}")
         |> Req.Request.put_header("Content-Type", "application/json")
         |> Req.post(
           json: %{
             documents: documents,
             model: model,
             query: query,
             top_n: top_n
           }
         ) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body}

      {:ok, %Req.Response{status: status, body: body}} ->
        {:error, "Error: #{status} - #{body[:message]}"}

      error ->
        Logger.error("Error: #{inspect(error)}")
        {:error, :unknown_error}
    end
  end
end
