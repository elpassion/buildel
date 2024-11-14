defmodule Buildel.ClientMocks.Memory do
  use Buildel.ClientMocks.ClientMock

  def delete(context_id, collection, file_id) do
    get_mock(:delete).(context_id, collection, file_id)
  end

  def create(context_id, collection, file, metadata) do
    get_mock(:create).(context_id, collection, file, metadata)
  end


  def get_vector_db(context_id, collection_name) do
    {:ok, %{}}
  end

  def get_global_collection(context_id, collection_name) do

    {:ok, %{}, "name"}
  end

  defp secret(context_id, secret_id) do
    "secret"
  end
end
