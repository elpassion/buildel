defmodule Buildel.Memories.MemoryCollectionSearch do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Organizations
  alias Buildel.VectorDB.EctoAdapter.Chunk

  import Ecto.Query

  defmodule Params do
    @default_params %{
      search_query: "",
      limit: 10,
      token_limit: nil,
      extend_neighbors: false,
      extend_parents: false
    }

    defstruct [:search_query, :limit, :token_limit, :extend_neighbors, :extend_parents]

    def from_map(params) do
      %__MODULE__{}
      |> struct(Map.merge(@default_params, params))
    end
  end

  def search(%Organization{} = organization, %MemoryCollection{} = collection, %Params{} = params) do
    workflow = get_workflow(organization, collection)

    result =
      workflow
      |> Buildel.DocumentWorkflow.query_database(params.search_query, %{}, %{
        limit: params.limit,
        similarity_threshhold: 0
      })

    case params do
      %Params{extend_parents: true} ->
        extend_parents_query(result, workflow)

      %Params{extend_neighbors: true} ->
        extend_neighbors_query(result, workflow)

      %Params{extend_neighbors: false, extend_parents: false} ->
        result

      _ ->
        result
    end
  end

  defp extend_parents_query(result, workflow) do
    Enum.map(result, fn chunk ->
      parent_context =
        Buildel.Repo.all(
          from c in Chunk,
            where:
              (c.collection_name == ^workflow.collection_name and
                 fragment("metadata->>'parent' = ?", ^chunk["metadata"]["parent"])) or
                c.id == ^chunk["metadata"]["parent"],
            order_by: fragment("metadata->>'index' ASC")
        )
        |> Enum.map(fn chunk ->
          chunk.document
        end)

      combined_document = parent_context |> Enum.join(" ")

      Map.put(chunk, "document", combined_document)
    end)
  end

  defp extend_neighbors_query(result, workflow) do
    all_chunks = workflow |> Buildel.DocumentWorkflow.get_all_from_database()

    Enum.map(result, fn chunk ->
      prev_id = Map.get(chunk["metadata"], "prev")
      next_id = Map.get(chunk["metadata"], "next")

      prev = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == prev_id end)
      next = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == next_id end)

      prev_doc = Map.get(prev, "document", "")
      next_doc = Map.get(next, "document", "")

      combined_document = [prev_doc, chunk["document"], next_doc] |> Enum.join(" ")

      Map.put(chunk, "document", combined_document)
    end)
  end

  defp get_workflow(%Organization{} = organization, %MemoryCollection{} = collection) do
    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = Memories.organization_collection_name(organization, collection)

    Buildel.DocumentWorkflow.new(%{
      embeddings:
        Buildel.Clients.Embeddings.new(%{
          api_type: collection.embeddings_api_type,
          model: collection.embeddings_model,
          api_key: api_key.value
        }),
      collection_name: organization_collection_name,
      db_adapter: Buildel.VectorDB.EctoAdapter,
      workflow_config: %{
        chunk_size: collection.chunk_size,
        chunk_overlap: collection.chunk_overlap
      }
    })
  end
end
