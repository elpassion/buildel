defmodule Buildel.Blocks.NewBlock do
  defstruct [:name, :type, connections: [], opts: %{}, context: %{}, state: %{}]

  @doc false
  defmacro __using__(_opts) do
    quote do
      alias Buildel.Blocks.Utils.Message
      alias Buildel.Blocks.Utils.Schemas
      alias Buildel.Blocks.Utils.Options

      import Buildel.Blocks.NewBlock.Definput
      import Buildel.Blocks.NewBlock.Defoutput
      import Buildel.Blocks.NewBlock.Defblock
      import Buildel.Blocks.NewBlock.Defoption

      use Buildel.Blocks.NewBlock.Server

      @inputs []
      @outputs []

      @schema_opts []

      @spec create(map) :: %Buildel.Blocks.Block{}
      def create(%{name: name, opts: opts, connections: connections}) do
        %Buildel.Blocks.Block{
          name: name,
          type: __MODULE__,
          opts: opts,
          connections: connections,
          state: %{}
        }
      end

      @before_compile Buildel.Blocks.NewBlock
    end
  end

  defmacro __before_compile__(_) do
    alias Buildel.Blocks.Utils.Options

    quote do
      @spec inputs :: [%Buildel.Blocks.NewBlock.Input{}]
      def inputs do
        @inputs
      end

      @spec outputs :: [%Buildel.Blocks.NewBlock.Output{}]
      def outputs do
        @outputs
      end

      @spec options :: %Buildel.Blocks.Utils.Options{}
      def options do
        @options
        |> Options.set_inputs(@inputs)
        |> Options.set_outputs(@outputs)
        |> Options.set_ios([])
        |> Options.set_dynamic_ios(nil)
        |> Options.set_schema(@schema_opts)
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Input do
  defstruct [:name, :schema, type: :text, public: false]
end

defmodule Buildel.Blocks.NewBlock.Output do
  defstruct [:name, :schema, type: :text, public: false]
end

defmodule Buildel.Blocks.NewBlock.Defblock do
  defmacro defblock(type, options_list) do
    quote do
      @options Buildel.Blocks.Utils.Options.new(%{
                 type: unquote(type),
                 description: unquote(options_list)[:description],
                 groups: unquote(options_list)[:groups]
               })
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Definput do
  alias Buildel.Blocks.Utils.Message

  defmacro definput(name, schema, options \\ []) do
    quote do
      {:ok, options} = unquote(options) |> Keyword.validate(public: false, type: :text)

      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        :binary ->
          nil

        _ ->
          throw("Invalid schema")
      end

      @inputs [
        %Buildel.Blocks.NewBlock.Input{
          name: unquote(name),
          schema: unquote(schema),
          public: options[:public],
          type: options[:type]
        }
        | @inputs
      ]

      case unquote(schema) do
        %{} ->
          @spec validate_input(unquote(name), Message.t()) :: :ok | {:error, :invalid_input}
          def validate_input(unquote(name), %Message{} = message) do
            case ExJsonSchema.Validator.valid?(unquote(schema), message.message) do
              true -> :ok
              false -> {:error, :invalid_input}
            end
          end

        :binary ->
          @spec validate_input(unquote(name), Message.t()) :: :ok | {:error, :invalid_input}
          def validate_input(unquote(name), %Message{} = message) do
            case is_binary(message.message) do
              true -> :ok
              false -> {:error, :invalid_input}
            end
          end
      end

      @spec input(any(), unquote(name), Message.t()) :: :ok | {:error, :invalid_input}
      def input(state, unquote(name), %Message{} = message) do
        case validate_input(unquote(name), message) do
          :ok ->
            handle_input(unquote(name), message, state)

          {:error, :invalid_input} ->
            send_error(state, :invalid_input)
            {:error, :invalid_input, state}
        end
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Defoutput do
  alias Buildel.Blocks.Utils.Message

  defmacro defoutput(name, schema, _options \\ []) do
    quote do
      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        :binary ->
          nil

        _ ->
          throw("Invalid schema")
      end

      @outputs [
        %Buildel.Blocks.NewBlock.Output{name: unquote(name), schema: unquote(schema)} | @outputs
      ]

      case unquote(schema) do
        %{} ->
          defp validate_output(unquote(name), %Message{} = message) do
            case ExJsonSchema.Validator.valid?(unquote(schema), message.message) do
              true -> :ok
              false -> {:error, :invalid_output}
            end
          end

        :binary ->
          defp validate_output(unquote(name), %Message{} = message) do
            case is_binary(message.message) do
              true -> :ok
              false -> {:error, :invalid_output}
            end
          end
      end

      def output(state, unquote(name), %Message{} = message) do
        case validate_output(unquote(name), message) do
          :ok ->
            handle_output(unquote(name), message, state)

          {:error, :invalid_output} ->
            send_error(state, :invalid_output)
            {:error, :invalid_output, state}
        end
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Defoption do
  defmacro defoption(name, schema) do
    quote do
      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        _ ->
          throw("Invalid schema")
      end

      @schema_opts Keyword.put(@schema_opts, unquote(name), unquote(schema))

      def option(state, unquote(name)) do
        state.block.opts[unquote(name)] || unquote(schema).default
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Server do
  alias Buildel.BlockPubSub
  alias Buildel.Blocks.Utils.Message
  alias Buildel.Blocks.NewBlock.StreamState

  defmacro __using__(_opts) do
    quote do
      use GenServer
      alias Buildel.Blocks.NewBlock.StreamState

      def start_link(%{block: block, context: context}) do
        GenServer.start_link(
          __MODULE__,
          %{block: block, context: context},
          name: context.block_id |> String.to_atom()
        )
      end

      @impl true
      def init(%{block: block} = server_state) do
        subscribe_to_connections(
          block.context.context_id,
          all_connections(block)
        )

        stream_state_state =
          Enum.reduce(
            outputs(),
            StreamState.State.new(),
            &StreamState.State.add_output(&2, &1.name)
          )

        {:ok, stream_state_pid} =
          StreamState.start_link(block.context.block_id, stream_state_state)

        {:ok, server_state |> Map.put(:stream_state_pid, stream_state_pid)}
      end

      @impl true
      def handle_info(%Message{topic: topic} = message, state) do
        context_id =
          BlockPubSub.io_from_topic(topic)

        if context_id.context == state.block.context.context_id do
          state =
            inputs_subscribed_to_topic(all_connections(state.block), topic)
            |> Enum.map(fn
              %{name: input_name} = input when is_binary(input_name) ->
                %{input | name: String.to_existing_atom(input_name)}

              input ->
                input
            end)
            |> Enum.reduce(
              state,
              fn
                %{name: input_name}, state ->
                  case input(state, input_name, message) do
                    {:ok, state} -> state
                    {:error, _reason, state} -> state
                  end
              end
            )

          {:noreply, state}
        else
          state = handle_external_input(topic, message, state)
          {:noreply, state}
        end
      end

      @impl true
      def handle_info({_topic, :start_stream, nil, _metadata}, state) do
        {:noreply, state}
      end

      @impl true
      def handle_info({_topic, :stop_stream, nil, _metadata}, state) do
        {:noreply, state}
      end

      def handle_external_input(_name, _payload, state) do
        state
      end

      def handle_output(name, message, state) do
        send_stream_start(state, name)

        Buildel.BlockPubSub.broadcast_to_io(
          state.block.context.context_id,
          state.block.name,
          name,
          message
        )

        send_stream_stop(state, name)

        {:ok, state}
      end

      defp send_stream_start(state, name) do
        unless state.stream_state_pid |> StreamState.output_streaming?(name) do
          state.stream_state_pid |> StreamState.start_output_streaming(name)

          BlockPubSub.broadcast_to_io(
            state.block.context.context_id,
            state.block.name,
            name,
            {:start_stream, nil}
          )
        end

        unless state.stream_state_pid |> StreamState.any_output_streaming?() do
          BlockPubSub.broadcast_to_block(
            state.block.context.context_id,
            state.block.name,
            {:start_stream, nil}
          )
        end
      end

      defp send_stream_stop(state, name) do
        if state.stream_state_pid |> StreamState.output_streaming?(name) do
          state.stream_state_pid |> StreamState.stop_output_streaming(name)

          BlockPubSub.broadcast_to_io(
            state.block.context.context_id,
            state.block.name,
            name,
            {:stop_stream, nil}
          )
        end

        unless state.stream_state_pid |> StreamState.any_output_streaming?() do
          BlockPubSub.broadcast_to_block(
            state.block.context.context_id,
            state.block.name,
            {:stop_stream, nil}
          )
        end
      end

      defp send_error(state, error_message) do
        BlockPubSub.broadcast_to_block(
          state.block.context.context_id,
          state.block.name,
          {:error, [error_message]}
        )
      end

      def all_connections(block) do
        block.connections ++ public_connections(block.name)
      end

      def public_connections(block_name) do
        __MODULE__.inputs()
        |> Enum.filter(fn input -> input.public end)
        |> Enum.map(fn input ->
          %Buildel.Blocks.Connection{
            from: %Buildel.Blocks.Output{
              name: input.name,
              block_name: block_name,
              type: input.type
            },
            to: %Buildel.Blocks.Input{
              name: input.name,
              block_name: block_name,
              type: input.type
            },
            opts: %{reset: true}
          }
        end)
      end

      defp subscribe_to_connections(context_id, connections) do
        connections
        |> Enum.map(fn connection ->
          BlockPubSub.subscribe_to_io(context_id, connection)
        end)
      end

      defp inputs_subscribed_to_topic(connections, topic) do
        %{block: block, io: output_name} = BlockPubSub.io_from_topic(topic)

        connections
        |> Enum.filter(fn connection ->
          connection.from.block_name == block &&
            connection.from.name |> to_string() == output_name |> to_string()
        end)
        |> Enum.map(& &1.to)
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.StreamState do
  use Agent
  alias Buildel.Blocks.NewBlock.StreamState.State

  def start_link(block_id, initial_state) do
    Agent.start_link(fn -> initial_state end, name: :"#{block_id}._stream_state")
  end

  def output_streaming?(pid, output_id) do
    Agent.get(pid, &State.output_streaming?(&1, output_id))
  end

  def any_output_streaming?(pid) do
    Agent.get(pid, &State.any_output_streaming?(&1))
  end

  def start_output_streaming(pid, output_id) do
    Agent.update(pid, &State.start_output_streaming(&1, output_id))
  end

  def stop_output_streaming(pid, output_id) do
    Agent.update(pid, &State.stop_output_streaming(&1, output_id))
  end

  defmodule State do
    defstruct [:output_states]

    def new do
      %Buildel.Blocks.NewBlock.StreamState.State{
        output_states: %{}
      }
    end

    def add_output(state, output_id) do
      put_in(state.output_states[output_id], false)
    end

    def any_output_streaming?(state) do
      Enum.any?(state.output_states, fn _ -> true end)
    end

    def output_streaming?(state, output_id) do
      get_in(state.output_states[output_id]) || false
    end

    def start_output_streaming(state, output_id) do
      put_in(state.output_states[output_id], true)
    end

    def stop_output_streaming(state, output_id) do
      put_in(state.output_states[output_id], false)
    end
  end
end
