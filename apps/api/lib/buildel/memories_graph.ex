defmodule Buildel.MemoriesGraph do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories.MemoryCollection

  def get_similarity_martix(
        %Organization{} = organization,
        %MemoryCollection{} = collection,
        top_percentage
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: collection.embeddings_secret_name,
            endpoint: collection.embeddings_endpoint
          })
      })

    relations =
      Buildel.VectorDB.get_relations(vector_db, collection_name)

    relations |> build_similarity_matrix() |> filter_top_percent_similarities(top_percentage)
  end

  defp build_similarity_matrix(rows) do
    matrix = %{}

    Enum.reduce(rows, matrix, fn {id1, id2, similarity}, acc ->
      acc
      |> Map.update(id1, %{id2 => similarity}, &Map.put(&1, id2, similarity))
      |> Map.update(id2, %{id1 => similarity}, &Map.put(&1, id1, similarity))
    end)
  end

  defp filter_top_percent_similarities(matrix, top_percentage) do
    Enum.reduce(matrix, %{}, fn {id, similarities}, acc ->
      sorted_similarities =
        similarities
        |> Enum.sort_by(fn {_other_id, similarity} -> similarity end, :desc)

      top_count = Float.ceil(length(sorted_similarities) * top_percentage / 100.0) |> round()
      top_similarities = Enum.take(sorted_similarities, top_count)

      acc |> Map.put(id, Map.new(top_similarities))
    end)
  end
end
