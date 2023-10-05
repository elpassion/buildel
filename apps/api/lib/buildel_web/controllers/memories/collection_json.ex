defmodule BuildelWeb.CollectionJSON do
  alias Buildel.Memories.MemoryCollection

  def index(%{collections: collections}) do
    %{data: for(collection <- collections, do: data(collection))}
  end

  def show(%{collection: collection}) do
    %{data: data(collection)}
  end

  defp data(%MemoryCollection{} = collection) do
    %{
      id: collection.id,
      collection_name: collection.collection_name,
    }
  end
end
  