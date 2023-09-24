defmodule Buildel.Blocks.Block do
  alias Buildel.BlockPubSub
  defstruct [:name, :type, opts: %{}]

  def audio_input(name \\ "input", public \\ false),
    do: %{name: name, type: "audio", public: public}

  def audio_output(name \\ "output", public \\ false),
    do: %{name: name, type: "audio", public: public}

  def text_output(name \\ "output", public \\ false),
    do: %{name: name, type: "text", public: public}

  def text_input(name \\ "input", public \\ false),
    do: %{name: name, type: "text", public: public}

  def file_output(name \\ "output", public \\ false),
    do: %{name: name, type: "file", public: public}

  def file_input(name \\ "input", public \\ false),
    do: %{name: name, type: "file", public: public}

  def name(pid) do
    GenServer.call(pid, :name)
  end

  def block_name(pid) do
    GenServer.call(pid, :block_name)
  end

  def context_id(pid) do
    GenServer.call(pid, :context_id)
  end

  defmacro __using__(_opts) do
    quote do
      use GenServer
      use Buildel.Blocks.Utils.StreamState
      alias Buildel.Blocks.Block
      alias Buildel.BlockPubSub
      defstruct [:name, :type, opts: %{}]
      @behaviour Buildel.Blocks.BlockBehaviour

      def start_link(name: name, block_name: block_name, context_id: context_id, opts: opts) do
        GenServer.start_link(__MODULE__,
          name: name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        )
      end

      def stop(pid) do
        GenServer.stop(pid)
      end

      defdelegate name(pid), to: Block
      defdelegate block_name(pid), to: Block
      defdelegate context_id(pid), to: Block

      @impl true
      def handle_call(:name, _from, state) do
        {:reply, state[:name], state}
      end

      def handle_call(:block_name, _from, state) do
        {:reply, state[:block_name], state}
      end

      def handle_call(:context_id, _from, state) do
        {:reply, state[:context_id], state}
      end

      def handle_info({_topic, :start_stream, _} = message, state) do
        {:noreply, state}
      end

      def handle_info({_topic, :stop_stream, _} = message, state) do
        handle_stream_stop(message, state)
      end

      def handle_info({:stop_stream, output}, state) do
        state = send_stream_stop(state, output)
        {:noreply, state}
      end

      def handle_stream_stop({_topic, :stop_stream, output}, state) do
        {:noreply, state}
      end

      defoverridable handle_stream_stop: 2

      defp subscribe_to_inputs(context_id, inputs) do
        inputs
        |> Enum.map(fn input ->
          BlockPubSub.subscribe_to_io(context_id, input)
        end)
      end

      defp stream_timeout() do
        Application.get_env(:buildel, :stream_timeout, 500)
      end

      defp name_schema() do
        %{
          "type" => "string",
          "title" => "Name",
          "description" => "The name of the block.",
          "minLength" => 2
        }
      end

      defp inputs_schema() do
        %{
          "type" => "array",
          "title" => "Inputs",
          "description" => "The inputs to the block.",
          "items" => %{
            "type" => "string",
            "title" => "Name",
            "description" => "The name of the input.",
            "minLength" => 2
          }
        }
      end

      defp options_schema(
             %{"required" => _, "properties" => _} = schema \\ %{
               "required" => [],
               "properties" => %{}
             }
           ) do
        Map.merge(
          %{
            "type" => "object",
            "title" => "Options",
            "description" => "Additional options for the block.",
            "required" => [],
            "properties" => %{}
          },
          schema
        )
      end

      defp get_input(inputs, name) do
        %{block: block, io: output_name} = BlockPubSub.io_from_topic(name)

        input_name =
          Enum.find(inputs, fn input ->
            input |> String.contains?("#{block}:#{output_name}")
          end)

        case input_name |> String.split("->") do
          [_, input_name] -> input_name
          _ -> "input"
        end
      end

      defp broadcast_to_output(state, output_name, message) do
        BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          output_name,
          message
        )

        state
      end
    end
  end
end

defmodule Buildel.Blocks.BlockBehaviour do
  @callback options() :: %{
              type: String.t(),
              groups: list(String.t()),
              inputs: [%{name: String.t(), type: String.t(), public: boolean()}],
              outputs: [%{name: String.t(), type: String.t(), public: boolean()}],
              schema: map()
            }
  @callback schema() :: map()
  @callback input(pid, any()) :: :ok
end
