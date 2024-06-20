defmodule Buildel.Blocks.Timer do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "timer",
      description: "Used to emit a message after a specified time period.",
      groups: ["utils"],
      inputs: [Block.text_input("start")],
      outputs: [Block.text_output("on_stop")],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["time"],
            "properties" => %{
              time: %{
                "type" => "number",
                "title" => "Time (ms)",
                "description" => "Time in milliseconds after which the message will be emitted.",
                "default" => 60_000,
                "minimum" => 0,
                "step" => 1
              }
            }
          })
      }
    }
  end

  @impl true
  def setup(%{type: __MODULE__} = state) do
    {:ok, state |> Map.put(:timer, nil)}
  end

  def handle_input("start", {_name, :text, _text, _metadata}) do
    [
      {:start_stream, "on_stop"},
      {:call, &start_new_timer/1}
    ]
  end

  defp start_new_timer(state) do
    timer = UUID.uuid4()

    stream =
      Stream.timer(state.opts.time)
      |> Stream.map(fn _ -> {:call, &handle_timer_tick(&1, timer)} end)

    {stream, state |> Map.put(:timer, timer)}
  end

  defp handle_timer_tick(%{timer: timer} = state, timer_id) when timer == timer_id,
    do: {[{:output, "on_stop", {:text, "0", %{}}}, {:stop_stream, "on_stop"}], state}

  defp handle_timer_tick(state, _), do: {nil, state}
end
