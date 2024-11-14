defmodule Buildel.Blocks.NewBlock do
  alias Buildel.Blocks.Utils.Message
  defstruct [:name, :type, connections: [], opts: %{}, context: %{}, state: %{}]

  @doc false
  defmacro __using__(opts \\ []) do
    quote do
      require Logger
      alias Buildel.Blocks.Utils.Message
      alias Buildel.Blocks.Utils.Schemas
      alias Buildel.Blocks.Utils.Options

      @tool_controller unquote(opts[:tool_controller]) || false

      @inputs []
      @outputs []
      @dynamic_ios nil
      @tools []
      @sections []
      @section nil

      @schema_opts []

      def tool_contoller?, do: @tool_controller

      import Buildel.Blocks.NewBlock.Definput
      import Buildel.Blocks.NewBlock.Defoutput
      import Buildel.Blocks.NewBlock.Defblock
      import Buildel.Blocks.NewBlock.Defoption
      import Buildel.Blocks.NewBlock.Deftool
      import Buildel.Blocks.NewBlock.Defsection

      use Buildel.Blocks.NewBlock.Server, tool_controller: @tool_controller


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

      defp secret(state, secret_id) do
        Application.get_env(:buildel, :secret).secret_from_context(
          state.block.context.context,
          secret_id
        )
      end

      @before_compile Buildel.Blocks.NewBlock
      @before_compile Buildel.Blocks.NewBlock.Server
    end
  end

  defmacro __before_compile__(_) do
    alias Buildel.Blocks.Utils.Options

    quote do
      @spec inputs :: [%Buildel.Blocks.NewBlock.Input{}]
      def inputs do
        @inputs
      end

      @spec get_input(String.t()) :: %Buildel.Blocks.NewBlock.Input{}
      def get_input(input_name) when is_binary(input_name) do
        get_input(input_name |> String.to_existing_atom())
      end

      @spec get_input(term()) :: %Buildel.Blocks.NewBlock.Input{}
      def get_input(input_name) do
        inputs =
          if @tool_controller,
            do: @inputs ++ [%{name: :tools, type: :controller, public: false}],
            else: @inputs

        inputs
        |> Enum.find(fn input -> input.name == input_name end)
        |> then(&{:ok, &1})
      end

      @spec outputs :: [%Buildel.Blocks.NewBlock.Output{}]
      def outputs do
        @outputs
      end

      @spec get_output(String.t()) :: %Buildel.Blocks.NewBlock.Output{}
      def get_output(output_name) when is_binary(output_name) do
        get_output(output_name |> String.to_existing_atom())
      end

      @spec get_output(term()) :: %Buildel.Blocks.NewBlock.Output{}
      def get_output(output_name) do
        (@outputs ++ @tools)
        |> Enum.find(fn output -> output.name == output_name end)
        |> then(&{:ok, &1})
      end

      @spec tools :: [%Buildel.Blocks.NewBlock.Tool{}]
      def tools do
        @tools
      end

      @spec get_tool(String.t()) :: %Buildel.Blocks.NewBlock.Tool{}
      def get_tool(tool_name) when is_binary(tool_name) do
        get_tool(tool_name |> String.to_existing_atom())
      end

      @spec get_tool(term()) :: %Buildel.Blocks.NewBlock.Tool{}
      def get_tool(tool_name) do
        @tools
        |> Enum.find(fn tool -> tool.name == tool_name end)
        |> then(&{:ok, &1})
      end

      @spec get_connected_tool(any(), any()) :: %Buildel.Blocks.NewBlock.Tool{}
      defp get_connected_tool(state, connection) do
        Buildel.Pipelines.Worker.block_id(state.context.context_id, %{
          name: connection.from.block_name
        })
        |> String.to_existing_atom()
        |> Process.whereis()
        |> GenServer.call(
          {:get_tool, connection.from.name |> String.to_existing_atom(),
           Buildel.BlockPubSub.io_topic(
             state.block.context.context_id,
             state.block.name,
             connection.to.name
           )}
        )
      end

      @spec get_connected_tools(any()) :: list(%Buildel.Blocks.NewBlock.Tool{})
      defp get_connected_tools(state) do
        state.block.connections
        |> Enum.filter(fn
          %{to: %{type: :controller}} -> true
          _ -> false
        end)
        |> Enum.map(fn connection ->
          get_connected_tool(state, connection)
        end)
      end

      @spec options :: %Buildel.Blocks.Utils.Options{}
      def options do
        @options
        |> Options.set_sections(@sections)
        |> Options.set_inputs(@inputs)
        |> Options.set_outputs(@outputs)
        |> Options.set_tools(@tools, @tool_controller)
        |> Options.set_dynamic_ios(@dynamic_ios)
        |> Options.set_schema(@schema_opts |> Enum.reverse(), @tools)
      end

      @spec external_input(any(), String.t(), Message.t()) ::
              {:ok, any()} | {:error, :invalid_input, any()}
      def external_input(state, input_name, %Message{} = message) do
        handle_external_input(input_name, message, state)
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))

          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end

      @spec external_input_stream_start(any(), String.t(), Message.t()) ::
              {:ok, any()} | {:error, :invalid_input, any()}
      def external_input_stream_start(state, input_name, %Message{} = message) do
        handle_external_input_stream_start(input_name, message, state)
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))

          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end

      @spec external_input_stream_stop(any(), String.t(), Message.t()) ::
              {:ok, any()} | {:error, :invalid_input, any()}
      def external_input_stream_stop(state, input_name, %Message{} = message) do
        handle_external_input_stream_stop(input_name, message, state)
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))

          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Input do
  @derive Jason.Encoder
  defstruct [:name, :schema, type: :text, public: false, visible: true]
end

defmodule Buildel.Blocks.NewBlock.Output do
  @derive Jason.Encoder
  defstruct [:name, :schema, type: :text, public: false, visible: true]
end

defmodule Buildel.Blocks.NewBlock.Tool do
  @derive Jason.Encoder
  defstruct [:name, :schema, :description, :call, :call_formatter, :response_formatter, type: :worker]
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

defmodule Buildel.Blocks.NewBlock.Defsection do
  defmacro defsection(name, options, do: block) do
    quoted_block = quote do: unquote(block)

    quote do
      {:ok, options} =
        unquote(options)
        |> Keyword.validate([:title, :description, displayWhen: nil])

      @section unquote(name)
      @sections [{unquote(name), unquote(options)}] ++ @sections
      Code.eval_quoted(unquote(quoted_block), [], __ENV__)
      @section nil
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Definput do
  alias Buildel.Blocks.Utils.Message

  defmacro definput(name, options) do
    quote do

      {:ok, options} =
        unquote(options)
        |> Keyword.validate(public: false, type: :text, schema: %{}, visible: true)

      ExJsonSchema.Schema.resolve(options[:schema])

      @inputs [
        %Buildel.Blocks.NewBlock.Input{
          name: unquote(name),
          schema: unquote(options[:schema]),
          public: options[:public],
          type: options[:type],
          visible: options[:visible]
        }
        | @inputs
      ]

      @callback handle_input(unquote(name), Message.t(), any()) :: {:ok, any()}

      @spec input(any(), unquote(name), Message.t()) ::
              {:ok, any()} | {:error, :invalid_input, any()}
      def input(state, unquote(name), %Message{} = message) do
        with :ok <- validate_input(unquote(name), message),
             {:ok, state} <- handle_input(unquote(name), message, state) do
          {:ok, state}
        else
          {:error, :invalid_input} ->
            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message(:invalid_input)
            )

            {:error, :invalid_input, state}
          {:error, %Ecto.Changeset{} = changeset} ->
            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message("Error saving data to database")
            )

            {:error, :error_saving_data_to_database, state}
          {:error, %Jason.DecodeError{data: data} = error} ->
            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message("Error decoding JSON: #{inspect(data)}")
            )

            {:error, :json_decode_error, state}
          {:error, error} ->
            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message(error)
            )

            {:error, to_string(error), state}
        end
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))
          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end

      @spec validate_input(unquote(name), Message.t()) :: :ok | {:error, :invalid_input}
      defp validate_input(unquote(name), %Message{} = message) do
        case ExJsonSchema.Validator.valid?(unquote(options[:schema]), message.message) do
          true -> :ok
          false -> {:error, :invalid_input}
        end
      end
    end
  end

  defmacro defdynamicios(options \\ []) do
    quote do
      require Logger

      @dynamic_ios "/api/organizations/{{organization_id}}/pipelines/{{pipeline_id}}/blocks/{{block_name}}/inputs"

      {:ok, options} =
        unquote(options) |> Keyword.validate([])

      @callback handle_input(String.t(), Message.t(), any()) :: {:ok, any()}

      @spec input(any(), String.t(), Message.t()) ::
              {:ok, any()} | {:error, :invalid_input, any()}
      def input(state, dynamic_name, %Message{} = message) do
        handle_input(dynamic_name, message, state)
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))

          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end

      def output(state, dynamic_name, %Message{sent?: true} = message, options) do
        message = message |> Message.from_message()
        output(state, dynamic_name, message, options)
      end

      def output(state, dynamic_name, %Message{} = message, options) do
        {:ok, options} = Keyword.validate(options, stream_stop: :send, stream_start: :send)

        message = message |> Message.set_sent()

        handle_output(dynamic_name, message, options, state)
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))

          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(:something_went_wrong)
          )

          {:error, :something_went_wrong, state}
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Defoutput do
  alias Buildel.Blocks.Utils.Message

  defmacro defoutput(name, options \\ []) do
    quote do
      {:ok, options} =
        unquote(options)
        |> Keyword.validate(public: false, type: :text, schema: %{}, visible: true)

      ExJsonSchema.Schema.resolve(options[:schema])

      existing_outputs = @outputs

      @outputs [
        %Buildel.Blocks.NewBlock.Output{
          name: unquote(name),
          schema: unquote(options[:schema]),
          public: options[:public],
          type: options[:type],
          visible: options[:visible]
        }
        | @outputs
      ]

      if existing_outputs |> Enum.count() == 0 do
        def output(state, name, message, options \\ [])
      end

      def output(state, unquote(name) = output, %Message{sent?: true} = message, options) do
        message = message |> Message.from_message()
        output(state, output, message, options)
      end

      def output(state, unquote(name), %Message{} = message, options) do
        {:ok, options} = Keyword.validate(options, stream_stop: :send, stream_start: :send)

        message = message |> Message.set_sent()

        case validate_output(unquote(name), message) do
          :ok ->
            handle_output(unquote(name), message, options, state)

          {:error, :invalid_output} ->
            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message(:invalid_output)
            )

            {:error, :invalid_output, state}
        end
      end

      defp validate_output(unquote(name), %Message{} = message) do
        case ExJsonSchema.Validator.valid?(unquote(options[:schema]), message.message) do
          true -> :ok
          false -> {:error, :invalid_output}
        end
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Defoption do
  defmacro defoption(name, schema, options \\ []) do
    quote do
      {:ok, options} =
        unquote(options) |> Keyword.validate(required: true)

      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        _ ->
          throw("Invalid schema")
      end

      @schema_opts Keyword.put(@schema_opts, unquote(name), %{
                     schema: unquote(schema),
                     required: options[:required],
                     section: @section
                   })

      def option(state, unquote(name)) do
        state.block.opts[unquote(name)] ||
          unquote(schema) |> Map.get(:default, Map.get(unquote(schema), "default"))
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Deftool do
  require Logger
  alias Buildel.Blocks.Utils.Message

  defmacro deftool(name, options) do
    quote do
      require Logger

      {:ok, options} =
        unquote(options)
        |> Keyword.validate([:description, schema: %{}])

      ExJsonSchema.Schema.resolve(options[:schema])

      existing_tools = @tools

      @tools [
        %Buildel.Blocks.NewBlock.Tool{
          name: unquote(name),
          schema: unquote(options[:schema]),
          description: unquote(options[:description])
        }
        | @tools
      ]

      if existing_tools |> Enum.count() == 0 do
        def call_tool(state, message, options \\ [])
      end

      def call_tool(state, %Message{} = message, opts) do
        pid =
          state.block.context.block_id
          |> String.to_existing_atom()
          |> Process.whereis()

        GenServer.call(pid, {:call_tool, message}, 5 * 60_000)
      end

      @impl true
      def handle_call({:get_tool, unquote(name) = tool_name, topic}, from, state) do
        {:reply,
         handle_get_tool(unquote(name), state)
         |> then(
           &%{
             &1
             | name: "#{state.block.name}__#{&1.name}",
               call: fn args ->
                 case call_tool(
                        state,
                        Message.new(:tool_call, %{name: tool_name, args: args})
                        |> Message.set_topic(topic)
                      ) do
                   fun when is_function(fun) ->
                     Task.async(fun)
                     |> Task.await(5 * 60_000)

                   other ->
                     other
                 end
               end,
               call_formatter: tool_call_formatter(state, tool_name),
               response_formatter: tool_response_formatter(state, tool_name)
           }
         ), state}
      end

      def handle_get_tool(unquote(name), state) do
        @tools
        |> Enum.find(&(&1.name == unquote(name)))
      end

      defoverridable handle_get_tool: 2

      if existing_tools |> Enum.count() == 0 do
        def handle_call({:call_tool, %Message{} = message}, _from, state) do
          case handle_tool_call(message.message.name, message, state) do
            {:ok, response, state} ->
              {:reply, response, state}

            _ ->
              {:reply,
               Message.from_message(message)
               |> Message.set_type(:tool_response)
               |> Message.set_message("Something went wrong"), state}
          end
        rescue
          error ->
            Logger.error(Exception.format(:error, error, __STACKTRACE__))

            send_error(
              state,
              Message.from_message(message)
              |> Message.set_type(:text)
              |> Message.set_message(:something_went_wrong)
            )

            {:reply,
             Message.from_message(message)
             |> Message.set_type(:tool_response)
             |> Message.set_message("Something went wrong"), state}
        end
      end

      def tool_call_formatter(state, unquote(name) = tool_name) do
        pattern = state.block.opts[:"#{tool_name}_call_formatter"]

        fn args ->
          format_tool_message(pattern, args)
        end
      end

      def tool_response_formatter(state, unquote(name) = tool_name) do
        pattern = state.block.opts[:"#{tool_name}_response_formatter"]

        fn args ->
          format_tool_message(pattern, args)
        end
      end

      if existing_tools |> Enum.count() == 0 do
        defp format_tool_message(value, args) do
          args
          |> Enum.reduce(value, fn
            {key, value}, acc when is_number(value) ->
              String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

            {key, value}, acc when is_binary(value) ->
              String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

            {key, value}, acc when is_map(value) ->
              String.replace(acc, "{{#{key}}}", Jason.encode!(value))

            _, acc ->
              acc
          end)
        end
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Server do
  alias Buildel.BlockPubSub
  alias Buildel.Blocks.Utils.Message
  alias Buildel.Blocks.NewBlock.StreamState

  defmacro __using__(_opts \\ []) do
    quote do
      use GenServer
      alias Buildel.Blocks.NewBlock.StreamState
      alias Buildel.BlockPubSub

      def start_link(%{block: block, context: context}) do
        GenServer.start_link(
          __MODULE__,
          %{block: block, context: context},
          name: context.block_id |> String.to_atom()
        )
      end

      @impl true
      def init(%{block: block} = server_state) do
        subscribe_to_meta_events(block.context.context_id)

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

      def handle_info(:started, state) do
        {:ok, state} = handle_start(state)
        {:noreply, state}
      end

      @impl true
      def handle_info(%Message{topic: topic} = message, state) do
        state =
          if external_message?(message, state) do
            do_handle_info(message, state, external: true)
          else
            do_handle_info(message, state, external: false)
          end

        {:noreply, state}
      end

      @impl true
      def handle_info({topic, :start_stream, message, _metadata} = payload, state) do
        state =
          if external_message?(message, state) do
            do_handle_input_start_stream(payload, state, external: true)
          else
            do_handle_input_start_stream(payload, state, external: false)
          end

        {:noreply, state}
      end

      @impl true
      def handle_info({topic, :stop_stream, message, _metadata} = payload, state) do
        state =
          if external_message?(message, state) do
            do_handle_input_stop_stream(payload, state, external: true)
          else
            do_handle_input_stop_stream(payload, state, external: false)
          end

        {:noreply, state}
      end


      defp do_handle_info(%Message{topic: topic} = message, state, external: true) do
        context_id = BlockPubSub.io_from_topic(topic)

        case external_input(state, context_id.block <> ":" <> context_id.io, message) do
          {:ok, state} ->
            state

          {:error, _reason, state} ->
            state
        end
      end

      defp do_handle_input_start_stream({topic, :start_stream, message, _metadata}, state,
             external: false
           ) do
        inputs_subscribed_to_topic(all_connections(state.block), topic)
        |> Enum.reduce(
          state,
          fn
            %{name: input_name}, state ->
              {:ok, state} = handle_input_stream_start(input_name, message, state)
              state
          end
        )
      end

      defp do_handle_input_start_stream({topic, :start_stream, message, _metadata}, state,
             external: true
           ) do
        context_id = BlockPubSub.io_from_topic(topic)

        case handle_external_input_stream_start(
               context_id.block <> ":" <> context_id.io,
               message,
               state
             ) do
          {:ok, state} ->
            state

          {:error, _reason, state} ->
            state
        end
      end

      defp do_handle_input_stop_stream({topic, :stop_stream, message, _metadata}, state,
             external: false
           ) do
        inputs_subscribed_to_topic(all_connections(state.block), topic)
        |> Enum.reduce(
          state,
          fn
            %{name: input_name}, state ->
              {:ok, state} = handle_input_stream_stop(input_name, message, state)
              state
          end
        )
      end

      defp do_handle_input_stop_stream({topic, :stop_stream, message, _metadata}, state,
             external: true
           ) do
        context_id = BlockPubSub.io_from_topic(topic)

        case handle_external_input_stream_stop(
               context_id.block <> ":" <> context_id.io,
               message,
               state
             ) do
          {:ok, state} ->
            state

          {:error, _reason, state} ->
            state
        end
      end

      def handle_start(state) do
        {:ok, state}
      end

      def handle_external_input(_name, _payload, state) do
        {:ok, state}
      end

      def handle_external_input_stream_start(dynamic_input, message, state) do
        send_stream_start(state, dynamic_input, message)
        {:ok, state}
      end

      def handle_external_input_stream_stop(dynamic_input, message, state) do
        send_stream_stop(state, dynamic_input, message)
        {:ok, state}
      end

      defoverridable handle_external_input: 3
      defoverridable handle_external_input_stream_start: 3
      defoverridable handle_external_input_stream_stop: 3
      defoverridable handle_start: 1

      defp handle_output(name, message, options, state) do
        case options[:stream_start] do
          :send -> send_stream_start(state, name, message)
          :none -> nil
          :schedule -> nil
        end

        Buildel.BlockPubSub.broadcast_to_io(
          state.block.context.context_id,
          state.block.name,
          name,
          message
        )

        case options[:stream_stop] do
          :send -> send_stream_stop(state, name, message)
          :none -> nil
          :schedule -> nil
        end

        {:ok, state}
      end

      defp send_stream_start(state, name, message) do
        unless state.stream_state_pid |> StreamState.any_output_streaming?() do
          BlockPubSub.broadcast_to_block(
            state.block.context.context_id,
            state.block.name,
            {:start_stream, nil}
          )
        end

        unless state.stream_state_pid |> StreamState.output_streaming?(name) do
          state.stream_state_pid |> StreamState.start_output_streaming(name, message)

          BlockPubSub.broadcast_to_io(
            state.block.context.context_id,
            state.block.name,
            name,
            {:start_stream, message}
          )
        end
      end

      defp send_stream_stop(state, name, message) do
        if state.stream_state_pid |> StreamState.output_streaming?(name) do
          state.stream_state_pid |> StreamState.stop_output_streaming(name, message)

          BlockPubSub.broadcast_to_io(
            state.block.context.context_id,
            state.block.name,
            name,
            {:stop_stream, message}
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
          {:error, error_message}
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

      defp subscribe_to_meta_events(context_id) do
        BlockPubSub.subscribe_to_meta_events(context_id)
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
        |> Enum.map(fn
          %{name: input_name} = input when is_binary(input_name) ->
            input_name =
              case String.split(input_name, ":") do
                [input_name] ->
                  String.to_existing_atom(input_name)

                [_, _] ->
                  input_name
              end

            %{input | name: input_name}

          input ->
            input
        end)
      end

      defp external_message?(%Message{topic: topic}, state) do
        context_id = BlockPubSub.io_from_topic(topic)
        context_id.context != state.block.context.context_id
      end
    end
  end

  defmacro __before_compile__(_) do
    quote do
      if ((@inputs |> length()) > 0) do
        defp do_handle_info(%Message{topic: topic} = message, state, external: false) do
          inputs_subscribed_to_topic(all_connections(state.block), topic)
          |> Enum.reduce(
            state,
            fn
              %{name: input_name}, state ->
                case input(state, input_name, message) do
                  {:ok, state} ->
                    state

                  {:error, _reason, state} ->
                    state
                end
            end
          )
        end
      end

      @spec handle_input_stream_start(term(), any(), any()) :: {:ok, any()}
      def handle_input_stream_start(input_name, _message, state) do
        {:ok, state}
      end

      @spec handle_input_stream_stop(term(), any(), any()) :: {:ok, any()}
      def handle_input_stream_stop(input_name, message, state) do
        {:ok, state}
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

  def start_output_streaming(pid, output_id, message) do
    Agent.update(pid, &State.start_output_streaming(&1, output_id, message))
  end

  def stop_output_streaming(pid, output_id, message) do
    Agent.update(pid, &State.stop_output_streaming(&1, output_id, message))
  end

  defmodule State do
    defstruct [:output_states]

    def new do
      %Buildel.Blocks.NewBlock.StreamState.State{
        output_states: %{}
      }
    end

    def add_output(state, output_id) do
      put_in(state.output_states[output_id], %{})
    end

    def any_output_streaming?(state) do
      Enum.any?(state.output_states, fn {_, output_streams} ->
        output_streams
        |> Enum.any?(fn {_, output_streaming?} -> output_streaming? end)
      end)
    end

    def output_streaming?(state, output_id) do
      get_in(state.output_states, [Access.key(output_id, %{})])
      |> Enum.any?(fn {_, output_streaming?} -> output_streaming? end)
    end

    def start_output_streaming(state, output_id, message) do
      streams =
        case state.output_states[output_id] do
          nil -> %{}
          streams -> streams
        end
        |> Map.put(message, true)

      put_in(state.output_states[output_id], streams)
    end

    def stop_output_streaming(state, output_id, message) do
      streams =
        case state.output_states[output_id] do
          nil -> %{}
          streams -> streams
        end
        |> Enum.map(fn {key, value} ->
          if value == false || key.id == message.id || key.parents |> Enum.member?(message.id) ||
               message.parents |> Enum.member?(key.id) do
            {key, false}
          else
            {key, true}
          end
        end)
        |> Enum.into(%{})

      put_in(state.output_states[output_id], streams)
    end
  end
end

defmodule Buildel.Blocks.NewBlock.HttpApi do
  defmacro __using__(_opts) do
    quote do
      def httpApi() do
        Application.fetch_env!(:buildel, :http_api)
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Clock do
  defmacro __using__(_opts) do
    quote do
      def clock() do
        Application.fetch_env!(:buildel, :clock)
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Memory do
  defmacro __using__(_opts) do
    quote do
      def memory() do
        Application.fetch_env!(:buildel, :memory)
      end
    end
  end
end


defmodule Buildel.Blocks.NewBlock.DocumentWorkflow do
  defmacro __using__(_opts) do
    quote do
      def document_workflow() do
        Application.fetch_env!(:buildel, :document_workflow)
      end
    end
  end
end

defmodule Buildel.Blocks.NewBlock.Image do
  defmacro __using__(_opts) do
    quote do
      def image() do
        Application.fetch_env!(:buildel, :image)
      end
    end
  end
end
