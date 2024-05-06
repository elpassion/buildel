defmodule Buildel.Pipelines.Log do
  @timestamps_opts [type: :naive_datetime_usec]

  use Ecto.Schema
  import Ecto.Changeset

  schema "pipeline_logs" do
    belongs_to(:run, Buildel.Pipelines.Run)

    field(:message_type, Ecto.Enum,
      values: [binary: 0, text: 1, start_stream: 2, stop_stream: 3, error: 4]
    )

    field(:message, :string)
    field(:latency, :integer)
    field(:block_name, :string)
    field(:output_name, :string)

    timestamps(type: :naive_datetime_usec)
  end

  @doc false
  def changeset(log, attrs) do
    log
    |> cast(attrs, [
      :run_id,
      :message_type,
      :message,
      :latency,
      :block_name,
      :output_name
    ])
    |> validate_required([:run_id, :message_type, :message])
    |> assoc_constraint(:run)
  end
end
