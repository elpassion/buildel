defmodule Buildel.Blocks.TakeLatest do
  require Logger
  use Buildel.Blocks.Block

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

    messages =
      Enum.reduce(opts.inputs, %{}, fn input, messages -> messages |> Map.put(input, nil) end)

    {:ok, state |> assign_stream_state |> Keyword.put(:messages, messages)}
  end

  @impl true
  def handle_cast({:combine, {topic, {:text, text}}}, state) do
    state = state |> send_stream_start("output")
    ["context", _context, "block", block, "io", output] = String.split(topic, ":")

    state = put_in(state, [:messages, "#{block}:#{output}"], text)

    message =
      state[:messages]
      |> Enum.reduce(state[:opts].template, fn
        {_input, nil}, template -> template
        {input, text}, template -> String.replace(template, "{#{input}}", text)
      end)

    state =
      if String.contains?(message, state[:opts].inputs) do
        state
      else
        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "output",
          {:text, message}
        )

        state =
          if state[:opts].reset do
            messages =
              Enum.reduce(state[:opts].inputs, %{}, fn input, messages ->
                messages |> Map.put(input, nil)
              end)

            Keyword.put(state, :messages, messages)
          else
            state
          end

        state |> send_stream_stop("output")
      end

    {:noreply, state}
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    input(self(), {name, {:text, message}})
    {:noreply, state}
  end
end
