defmodule Buildel.Logs do
  use GenServer

  def start_link(args) do
    GenServer.start_link(__MODULE__, args)
  end

  def init(_initial_state) do
    Phoenix.PubSub.subscribe(Buildel.PubSub, "buildel::logger")
    {:ok, %{}}
  end

  def handle_info(message, state) do
    log_message(message)
    {:noreply, state}
  end

  defp log_message({topic, message_type, content}) do
    %{block: block_name, io: output_name, context: context} =
      Buildel.BlockPubSub.io_from_topic(topic)

    %{
      global: global,
      parent: parent,
      local: local
    } = block_context().context_from_context_id(context)

    message =
      case content do
        content when is_list(content) -> content |> Enum.join("\n")
        content -> content
      end

    pipeline_logger().save_log(%{
      global: global,
      parent: parent,
      local: local,
      block_name: block_name,
      output_name: output_name,
      message_type: message_type,
      message: message,
      metadata: %{},
      latency: 0
    })
  end

  defp pipeline_logger() do
    Application.fetch_env!(:buildel, :pipeline_logger)
  end

  defp block_context() do
    Application.fetch_env!(:buildel, :block_context_resolver)
  end
end

defmodule Buildel.Logs.LoggerBehaviour do
  @type log_data :: %{
          global: String.t(),
          parent: String.t(),
          local: String.t(),
          block_name: String.t(),
          output_name: String.t(),
          message_type: :binary | :text | :start_stream | :stop_stream | :error,
          message: String.t(),
          metadata: map(),
          latency: integer()
        }

  @callback save_log(log_data()) :: :ok
end

defmodule Buildel.Logs.DBPipelineLogger do
  use GenServer
  import Ecto.Query, warn: false
  alias Buildel.Repo
  alias Buildel.Pipelines.Log

  @behaviour Buildel.Logs.LoggerBehaviour

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def save_log(log_data) do
    GenServer.cast(__MODULE__, {:save_log, log_data})
  end

  @impl true
  def init(_initial_state) do
    {:ok, %{runs: %{}}}
  end

  @impl true
  def handle_cast({:save_log, log_data}, state) do
    do_save_log(log_data)
    {:noreply, state}
  end

  defp do_save_log(%{
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
      run_id: String.to_integer(run_id),
      block_name: block_name,
      output_name: output_name,
      message_type: message_type,
      message: message,
      latency: latency
    }
    |> Repo.insert()
  end
end
