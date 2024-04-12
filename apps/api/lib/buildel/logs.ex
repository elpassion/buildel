defmodule Buildel.Logs do
  alias Buildel.Logs.DBPipelineLogger
  use GenServer

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_initial_state) do
    Phoenix.PubSub.subscribe(Buildel.PubSub, "buildel::logger")
    {:ok, %{}}
  end

  def handle_cast({:log, message}, state) do
    log_message(message)
    {:noreply, state}
  end

  def handle_info(message, state) do
    GenServer.cast(__MODULE__, {:log, message})
    {:noreply, state}
  end

  defp log_message({topic, message_type, content}) do
    %{block: block_name, io: output_name, context: context} =
      Buildel.BlockPubSub.io_from_topic(topic)

    %{
      global: global,
      parent: parent,
      local: local
    } = Buildel.BlockContext.context_from_context_id(context)

    message =
      case content do
        content when is_list(content) -> content |> Enum.join("\n")
        content -> content
      end

    DBPipelineLogger.save_log(%{
      global: String.to_integer(global),
      parent: String.to_integer(parent),
      local: String.to_integer(local),
      block_name: block_name,
      output_name: output_name,
      message_type: message_type,
      message: message,
      metadata: %{},
      latency: 0
    })
  end
end

defmodule Buildel.LoggerBehaviour do
  @type log_data :: %{
          global: integer(),
          parent: integer(),
          local: integer(),
          block_name: String.t(),
          output_name: String.t(),
          message_type: :binary | :text | :start_stream | :stop_stream | :error,
          message: String.t(),
          metadata: map(),
          latency: integer()
        }

  @callback save_log(log_data()) :: map()
end

defmodule Buildel.Logs.DBPipelineLogger do
  import Ecto.Query, warn: false
  alias Buildel.Repo
  alias Buildel.Pipelines.Log

  @behaviour Buildel.LoggerBehaviour

  @impl true
  def save_log(%{
        global: _global,
        parent: _parent,
        local: run_id,
        block_name: block_name,
        output_name: output_name,
        message_type: message_type,
        message: message,
        metadata: _metadata,
        latency: latency
      }) do
    %Log{
      run_id: run_id,
      block_name: block_name,
      output_name: output_name,
      message_type: message_type,
      message: message,
      latency: latency
    }
    |> Repo.insert()
  end
end
