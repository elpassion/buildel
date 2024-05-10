defmodule Buildel.LogsAggregator do
  use GenServer

  defmodule AggregatedLog do
    defstruct [
      :block_name,
      :created_at,
      :context,
      message: "",
      message_types: [],
      raw_logs: [],
      corrupted: false
    ]
  end

  import Ecto.Query

  alias Buildel.Repo
  alias Buildel.Pipelines.Log
  alias Phoenix.PubSub

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_initial_state) do
    Process.send_after(self(), {:flush}, 5000)
    {:ok, %{}}
  end

  def handle_info({:flush}, _state) do
    Process.send_after(self(), {:flush}, 5000)
    aggregate_and_save_logs()
    {:noreply, %{}}
  end

  def aggregate_and_save_logs() do
    logs =
      from(l in Log, where: l.processed == false, order_by: [asc: l.inserted_at])
      |> Repo.all()
      |> Repo.preload(run: :pipeline)

    aggregated = aggregate_logs(logs)

    {_, saved_logs} = save_aggregated_logs(aggregated)

    set_processed(aggregated)

    for %Buildel.Pipelines.AggregatedLog{} = log <- saved_logs || [] do
      if log.context do
        %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: run_id} =
          from_log_context(log.context)

        topic = "logs::#{organization_id}::#{pipeline_id}::#{run_id}"

        Buildel.PubSub
        |> PubSub.broadcast!(
          topic,
          {topic, BuildelWeb.OrganizationPipelineRunLogsJSON.show(%{log: log})}
        )
      end
    end

    saved_logs
  end

  defp save_aggregated_logs(aggregated_logs) do
    Repo.insert_all(
      Buildel.Pipelines.AggregatedLog,
      aggregated_logs |> Enum.map(&create_db_aggregated_log/1),
      returning: true
    )
  end

  defp create_db_aggregated_log(%AggregatedLog{} = log) do
    %{run_id: run_id} = from_log_context(log.context)

    %{
      run_id: String.to_integer(run_id),
      message_types: log.message_types |> Enum.map(&to_string/1),
      raw_logs: log.raw_logs,
      message: log.message,
      block_name: log.block_name,
      context: log.context,
      inserted_at: log.created_at,
      updated_at: log.created_at
    }
  end

  defp set_processed(aggregated_logs) do
    for %AggregatedLog{raw_logs: log_ids} <- aggregated_logs do
      from(l in Log, where: l.id in ^log_ids)
      |> Repo.update_all(set: [processed: true])
    end
  end

  defp aggregate_logs(logs_list) do
    {aggregated, _corrupted_logs} =
      logs_list
      |> Enum.reduce({[], %{}}, fn log, {aggregated_list, current} ->
        log_context = get_log_context(log)
        message_type = log.message_type

        default_log = %AggregatedLog{
          block_name: log.block_name,
          created_at: log.inserted_at,
          message_types: [message_type],
          raw_logs: [log.id],
          context: log_context
        }

        case message_type do
          :start_stream ->
            current =
              Map.put(current, log_context, default_log)

            {aggregated_list, current}

          :stop_stream ->
            current_block =
              Map.get(current, log_context, default_log)

            message_types = current_block.message_types ++ [message_type]
            raw_logs = current_block.raw_logs ++ [log.id]

            current_block =
              Map.put(current_block, :message_types, message_types)
              |> Map.put(:raw_logs, raw_logs)

            merged_list =
              aggregated_list ++ [current_block]

            current = Map.delete(current, log_context)
            {merged_list, current}

          :binary ->
            current_block = Map.get(current, log_context, default_log)

            message = current_block.message <> log.message
            message_types = current_block.message_types ++ [message_type]
            raw_logs = current_block.raw_logs ++ [log.id]

            current_block =
              current_block
              |> Map.put(:message, message)
              |> Map.put(:message_types, message_types)
              |> Map.put(:raw_logs, raw_logs)

            current = Map.put(current, log_context, current_block)
            {aggregated_list, current}

          :text ->
            current_block = Map.get(current, log_context, default_log)

            message = current_block.message <> log.message
            message_types = current_block.message_types ++ [message_type]
            raw_logs = current_block.raw_logs ++ [log.id]

            current_block =
              current_block
              |> Map.put(:message, message)
              |> Map.put(:message_types, message_types)
              |> Map.put(:raw_logs, raw_logs)

            current = Map.put(current, log_context, current_block)
            {aggregated_list, current}

          :error ->
            current_block = Map.get(current, log_context, default_log)

            message = current_block.message <> log.message
            message_types = current_block.message_types ++ [message_type]
            raw_logs = current_block.raw_logs ++ [log.id]

            current_block =
              current_block
              |> Map.put(:message, message)
              |> Map.put(:message_types, message_types)
              |> Map.put(:raw_logs, raw_logs)

            merged_list =
              aggregated_list ++ [current_block]

            current = Map.delete(current, log_context)
            {merged_list, current}
        end
      end)

    # IO.inspect(corrupted_logs)

    # todo: handle corrupted logs - they occur when a start_stream message is not followed by a stop_stream or error message
    # it happens when there is an unhandled exception in the block

    aggregated
  end

  defp get_log_context(%Log{} = log) do
    "#{log.run.pipeline.organization_id}::#{log.run.pipeline.id}::#{log.run.id}::#{log.block_name}::#{log.output_name}"
  end

  defp from_log_context(context) do
    [organization_id, pipeline_id, run_id, block_name, output_name] = String.split(context, "::")

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      run_id: run_id,
      block_name: block_name,
      output_name: output_name
    }
  end
end
