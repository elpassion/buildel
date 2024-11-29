defmodule Buildel.Clients.Memory do
  alias Buildel.Clients.Utils.Context

  def delete(context_id, collection, file_id) do
    %{global: organization_id} = Context.context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    memory =
      Buildel.Memories.get_collection_memory_by_file_uuid!(organization, collection.id, file_id)

    Buildel.Memories.delete_organization_memory(organization, collection.id, memory.id)
  end

  def create(context_id, collection, file, metadata) do
    %{global: organization_id} = Context.context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    Buildel.Memories.create_organization_memory(
      organization,
      collection,
      file,
      metadata
    )
  end

  def get_vector_db(context_id, collection_name) do
    %{global: organization_id} = Context.context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    api_key = secret(context_id, collection.embeddings_secret_name)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key,
            endpoint: collection.embeddings_endpoint
          })
      })

    {:ok, vector_db}
  end

  def get_global_collection(context_id, collection_name) do
    %{global: organization_id} = Context.context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    {:ok, collection, Buildel.Memories.organization_collection_name(organization, collection)}
  end

  defp secret(context_id, secret_id) do
    Application.get_env(:buildel, :secret).secret_from_context(
      Context.context_from_context_id(context_id),
      secret_id
    )
  end
end
