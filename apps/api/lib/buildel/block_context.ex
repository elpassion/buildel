defmodule Buildel.BlockContext do
  alias Buildel.Repo
  alias Buildel.Pipelines.Run

  def context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end

  def block_pid(context_id, block_name) do
    context = context_from_context_id(context_id)
    run = Repo.get!(Run, context[:local])
    Buildel.Pipelines.Runner.block_pid(run, block_name)
  end

  def create_run_auth_token(context_id, string) do
    %{ global: organization_id } = context_from_context_id(context_id)
    with secret when is_binary(secret) <- Buildel.Organizations.get_organization!(organization_id).api_key do
      {:ok, :crypto.mac(:hmac, :sha256, secret, string) |> Base.encode64()}
    else
      _ -> {:error, :not_found}
    end
  end
end
