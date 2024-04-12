defmodule Buildel.ClientMocks.DBPipelineLogger do
  @behaviour Buildel.Logs.LoggerBehaviour

  @impl true
  def save_log(_log_data) do
    :ok
  end
end
