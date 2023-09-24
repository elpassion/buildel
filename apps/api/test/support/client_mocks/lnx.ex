defmodule Buildel.ClientMocks.SearchDB.LNXAdapter do
  @behaviour Buildel.SearchDB.SearchAdapterBehaviour

  @impl true
  def add(_, _) do
    :ok
  end

  @impl true
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, %{name: collection_name}}
  end

  @impl true
  def delete_all_with_metadata(_, _) do
    :ok
  end

  @impl true
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl true
  def query(_, _) do
    {:ok, []}
  end
end
