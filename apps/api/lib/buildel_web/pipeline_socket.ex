defmodule BuildelWeb.PipelineSocket do
  use Phoenix.Socket
  use BuildelWeb.Validator

  channel "pipeline_runs:*", BuildelWeb.PipelineRunChannel
  channel "pipelines:*", BuildelWeb.PipelineChannel

  defparams :connect do
    required :id, :string
  end

  def connect(params, socket, _connect_info) do
    case validate(:connect, params) do
      {:ok, %{id: id}} ->
        {:ok, socket |> assign(:socket_id, id)}
      {:error, _} ->
        {:error, %{reason: "invalid"}}
    end
  end

  def id(socket), do: socket.assigns.socket_id
end
