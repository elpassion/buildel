defmodule BuildelWeb.PipelineSocket do
  alias Buildel.Organizations
  use Phoenix.Socket
  use BuildelWeb.Validator

  channel "pipeline_runs:*", BuildelWeb.PipelineRunChannel
  channel "pipelines:*", BuildelWeb.PipelineChannel

  defparams :connect do
    required(:api_key, :string)
    required(:organization_id, :integer)
  end

  def connect(params, socket, connect_info) do
    with {:ok, %{api_key: api_key, organization_id: organization_id}} <-
           validate(:connect, params),
         {:ok, organization} <-
           Organizations.get_organization_by_id_and_api_key(organization_id, api_key) do
      {:ok, socket |> assign(:organization, organization)}
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        {:error, BuildelWeb.ChangesetJSON.error(%{changeset: changeset})}

      _err ->
        {:error, %{errors: %{detail: "Not Found"}}}
    end
  end

  def id(_socket), do: nil
end
