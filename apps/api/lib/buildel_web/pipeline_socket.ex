defmodule BuildelWeb.PipelineSocket do
  use Phoenix.Socket

  channel "pipeline_runs:*", BuildelWeb.PipelineRunChannel
  channel "pipelines:*", BuildelWeb.PipelineChannel

  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  def id(_socket), do: UUID.uuid4()
end
