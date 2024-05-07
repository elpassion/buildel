defmodule Buildel.Pipelines.AggregatedLog do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pipeline_aggregated_logs" do
    belongs_to(:run, Buildel.Pipelines.Run)

    field(:message_types, {:array, :string})
    field(:raw_logs, {:array, :integer})
    field(:message, :string)
    field(:block_name, :string)
    field(:context, :string)

    timestamps(type: :naive_datetime_usec)
  end

  @doc false
  def changeset(log, attrs) do
    log
    |> cast(attrs, [
      :run_id,
      :message_types,
      :raw_logs,
      :message,
      :block_name,
      :context
    ])
    |> validate_required([:run_id, :message])
    |> assoc_constraint(:run)
  end
end
