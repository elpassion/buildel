defmodule Buildel.Blocks.IF do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :compare
  defdelegate text_input(), to: Buildel.Blocks.Block
  defdelegate text_output(name), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "if",
      groups: ["utils"],
      inputs: [text_input()],
      outputs: [text_output("true"), text_output("false")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["condition"],
            "properties" => %{
              condition: %{
                "type" => "string",
                "title" => "Condition",
                "description" => "The value to compare the input to",
                "minLength" => 1
              }
            }
          })
      }
    }
  end

  # Client

  def compare(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:compare, text})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    {:ok, state |> assign_stream_state |> Keyword.put(:condition, opts[:condition])}
  end

  @impl true
  def handle_cast({:compare, {:text, text_value} = text}, state) do
    output =
      if text_value == state[:condition] do
        "true"
      else
        "false"
      end

    state = state |> send_stream_start(output)

    BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      output,
      text
    )

    state = state |> send_stream_stop(output)

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})
    {:noreply, state}
  end
end
