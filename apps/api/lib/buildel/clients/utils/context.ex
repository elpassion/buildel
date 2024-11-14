defmodule Buildel.Clients.Utils.Context do
  defmacro __using__(_opts) do
    quote do
      import Buildel.Clients.Utils.Context, only: [context_from_context_id: 1]
    end
  end

  def context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end
end
