defmodule Buildel.SearchDB do
  alias Buildel.Utils.TelemetryWrapper
  use TelemetryWrapper

  def init(collection_name) do
    with {:ok, _collection} <- adapter().create_collection(collection_name) do
      {:ok, %{name: collection_name}}
    else
      {:error, error} -> {:error, error}
    end
  end

  def add(collection_name, documents) do
    {:ok, collection} = adapter().get_collection(collection_name)

    adapter().add(collection, documents)

    {:ok, collection}
  end

  deftimed query(collection_name, query), [:buildel, :search_db, :query] do
    {:ok, collection} = adapter().get_collection(collection_name)

    {:ok, results} = adapter().query(collection, %{query: query})

    results
  end

  def delete_all_with_metadata(collection_name, metadata) do
    {:ok, collection} = adapter().get_collection(collection_name)

    adapter().delete_all_with_metadata(collection, metadata)
  end

  defp adapter do
    Application.fetch_env!(:buildel, :search_db)
  end
end

defmodule Buildel.SearchDB.SearchAdapterBehaviour do
  @callback get_collection(String.t()) :: {:ok, map()}
  @callback create_collection(String.t(), map()) :: {:ok, map()}
  @callback add(map(), map()) :: :ok
  @callback query(map(), map()) :: {:ok, list()}
  @callback delete_all_with_metadata(map(), map()) :: :ok
end

defmodule Buildel.SearchDB.LNXAdapter do
  @behaviour Buildel.SearchDB.SearchAdapterBehaviour

  @index_name "memories"

  @impl true
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl true
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, _} =
      follow_redirect_post(
        "#{url()}/indexes",
        Jason.encode!(%{
          index: %{
            name: @index_name,
            storage_type: "filesystem",
            max_concurrency: 2,
            fields: %{
              text: %{type: "text"},
              collection_name: %{type: "string"},
              file_name: %{type: "string"},
              memory_id: %{type: "string"},
              chunk_id: %{type: "string"}
            }
          }
        }),
        headers()
      )

    {:ok, %{name: collection_name}}
  end

  def delete_collection(collection_name) do
    {:ok, _} =
      follow_redirect_delete(
        "#{url()}/indexes/#{@index_name}",
        "{}",
        headers()
      )

    {:ok, %{name: collection_name}}
  end

  @impl true
  def add(collection, documents) do
    {:ok, _} =
      follow_redirect_post(
        "#{url()}/indexes/#{@index_name}/documents",
        Jason.encode!(
          documents
          |> Enum.map(fn document ->
            %{
              text: document.document,
              collection_name: collection.name,
              file_name: document.metadata.file_name,
              memory_id: document.metadata.memory_id |> Integer.to_string(),
              chunk_id: document.metadata.chunk_id
            }
          end)
        ),
        headers()
      )

    {:ok, _} =
      follow_redirect_post(
        "#{url()}/indexes/#{@index_name}/commit",
        Jason.encode!(%{}),
        headers()
      )

    :ok
  end

  @impl true
  def delete_all_with_metadata(collection, metadata) do
    filters =
      metadata
      |> Enum.map(fn
        {key, value} when is_integer(value) ->
          %{term: %{ctx: value |> Integer.to_string(), fields: [key]}, occur: "must"}

        {key, value} ->
          %{term: %{ctx: value, fields: [key]}, occur: "must"}
      end)

    {:ok, _} =
      follow_redirect_delete(
        "#{url()}/indexes/#{@index_name}/documents/query",
        Jason.encode!(%{
          query:
            [
              %{term: %{ctx: collection.name, fields: ["collection_name"]}, occur: "must"}
            ] ++ filters
        }),
        headers()
      )

    {:ok, _} =
      follow_redirect_post(
        "#{url()}/indexes/#{@index_name}/commit",
        Jason.encode!(%{}),
        headers()
      )

    :ok
  end

  @impl true
  def query(collection, %{query: query}) do
    {:ok, %{status_code: 200, body: body}} =
      follow_redirect_post(
        "#{url()}/indexes/#{@index_name}/search",
        Jason.encode!(%{
          query: [
            %{normal: %{ctx: query, fields: ["text"]}},
            %{term: %{ctx: collection.name, fields: ["collection_name"]}, occur: "must"}
          ],
          limit: 5
        }),
        headers()
      )

    response = Jason.decode!(body)

    {:ok,
     response["data"]["hits"]
     |> Enum.map(fn %{"doc" => doc} ->
       %{
         "document" => doc["text"],
         "metadata" => %{
           "file_name" => doc["file_name"],
           "memory_id" => doc["memory_id"] |> String.to_integer(),
           "chunk_id" => doc["chunk_id"],
           "collection_name" => doc["collection_name"]
         }
       }
     end)}
  end

  defp follow_redirect_post(url, body, headers, opts \\ []) do
    case HTTPoison.post(
           url,
           body,
           headers,
           opts ++ [follow_redirect: true]
         ) do
      {:ok, %HTTPoison.MaybeRedirect{redirect_url: redirect_url}} ->
        HTTPoison.post(redirect_url, body, headers, opts ++ [follow_redirect: true])

      response ->
        response
    end
  end

  defp follow_redirect_delete(url, body, headers, opts \\ []) do
    case HTTPoison.request(:delete, url, body, headers, opts) do
      {:ok, %HTTPoison.MaybeRedirect{redirect_url: redirect_url}} ->
        HTTPoison.request(:delete, redirect_url, body, headers, opts)

      response ->
        response
    end
  end

  defp url() do
    System.get_env("SEARCH_DB_URL")
  end

  defp headers() do
    [{"Content-Type", "application/json"}]
  end
end


defmodule Buildel.SearchDB.EctoAdapter do
  @behaviour Buildel.SearchDB.SearchAdapterBehaviour

  @impl true
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl true
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, %{name: collection_name}}
  end

  def delete_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl true
  def add(_collection, _documents) do
    :ok
  end

  @impl true
  def delete_all_with_metadata(_collection, _metadata) do
    :ok
  end

  @impl true
  def query(_collection, %{query: _query}) do
    {:ok, []}
  end
end
