defmodule Buildel.Blocks.TakeLatest do
  require Logger
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest

  # Config

  @impl true
  defdelegate input(pid, input_data), to: __MODULE__, as: :combine
  defdelegate text_output(), to: Block
  defdelegate text_input(), to: Block

  @impl true
  def options() do
    %{
      type: "take_latest",
      inputs: [text_input()],
      outputs: [text_output()],
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
            "required" => ["template", "reset"],
            "properties" => %{
              "template" => %{
                "type" => "string",
                "title" => "Template",
                "description" => "Output string from combined inputs.",
                "minLength" => 1
              },
              "reset" => %{
                "type" => "boolean",
                "title" => "Reset",
                "description" => "Reset all inputs after output."
              }
            }
          })
      }
    }
  end

  # Client

  def combine(pid, {_name, {:text, _text}} = input_data) do
    GenServer.cast(pid, {:combine, input_data})
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

    {:ok, state |> assign_stream_state |> assign_take_latest(opts.reset)}
  end

  @impl true
  def handle_cast({:combine, {topic, {:text, text}}}, state) do
    state = state |> send_stream_start("output") |> save_take_latest_message(topic, text)

    {state, message} =
      state |> interpolate_template_with_take_latest_messages(state[:opts].template)

    case message do
      nil ->
        {:noreply, state}

      message ->
        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "output",
          {:text, message}
        )

        state |> send_stream_stop("output")

        {:noreply, state}
    end
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    input(self(), {name, {:text, message}})
    {:noreply, state}
  end
end
