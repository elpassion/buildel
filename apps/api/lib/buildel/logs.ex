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
      created_at: NaiveDateTime.utc_now(:second),
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

  @batch_size 50

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def save_log(log_data) do
    GenServer.cast(__MODULE__, {:save_log, log_data})
  end

  @impl true
  def init(_initial_state) do
    Process.send_after(self(), {:flush}, 1000)
    {:ok, %{runs: %{}, logs: []}}
  end

  @impl true
  def handle_cast(
        {:save_log, %{local: run_id} = log_data},
        %{runs: runs, logs: logs} = state
      ) do
    runs = Map.put_new_lazy(runs, run_id, fn -> !!Buildel.Pipelines.get_run(run_id) end)

    should_save = Map.get(runs, run_id)

    logs = if should_save, do: [log_data | logs], else: logs
    {:noreply, %{state | runs: runs, logs: do_save_logs(logs)}}
  end

  @impl true
  def handle_info({:flush}, %{logs: logs} = state) do
    Process.send_after(self(), {:flush}, 1000)
    {:noreply, %{state | logs: do_save_logs(logs, true)}}
  end

  defp do_save_logs(logs, force \\ false)

  defp do_save_logs(logs, true) do
    Repo.insert_all(Log, logs |> Enum.map(&create_log/1))
    []
  end

  defp do_save_logs(logs, _force) when length(logs) > @batch_size do
    Repo.insert_all(Log, logs |> Enum.map(&create_log/1))
    []
  end

  defp do_save_logs(logs, _force), do: logs

  defp create_log(%{
         global: _global,
         parent: _parent,
         local: run_id,
         block_name: block_name,
         output_name: output_name,
         message_type: message_type,
         message: message,
         metadata: _metadata,
         latency: latency,
         created_at: inserted_at
       }) do
    message =
      case message_type do
        :binary -> "{binary}"
        _ -> message
      end

    %{
      run_id: String.to_integer(run_id),
      block_name: block_name,
      output_name: output_name,
      message_type: message_type,
      message: message,
      latency: latency,
      inserted_at: inserted_at,
      updated_at: inserted_at
    }
  end
end
