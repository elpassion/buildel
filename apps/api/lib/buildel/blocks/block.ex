defmodule Buildel.Blocks.Block do
  alias Buildel.BlockPubSub
  alias __MODULE__

  defstruct [:name, :type, connections: [], opts: %{}, context: %{}]

  def set_context(
        block,
        %{block_id: _block_id, context_id: _context_id, context: _context} = context
      ) do
    %{block | context: context}
  end

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

  def file_temporary_input(name \\ "input", public \\ false),
    do: %{name: name, type: "file_temporary", public: public}

  def io(name \\ "tool", role \\ "controller"),
    do: %{name: name, type: role, public: false}

  def name(pid) do
    GenServer.call(pid, :name)
  end

  def block_name(pid) do
    GenServer.call(pid, :block_name)
  end

  def type(pid) do
    GenServer.call(pid, :type)
  end

  def call(pid, method_name, args) do
    GenServer.call(pid, {method_name, args})
  end

  defmacro __using__(_opts) do
    quote do
      use GenServer
      use Buildel.Blocks.Utils.StreamState
      use Buildel.Blocks.Utils.Error
      alias Buildel.Blocks.Block
      alias Buildel.BlockPubSub
      @behaviour Buildel.Blocks.BlockBehaviour

      @impl true
      def init(%{block: block} = state) do
        subscribe_to_connections(
          block.context.context_id,
          all_connections(block)
        )

        state |> assign_stream_state(block.opts) |> setup()
      end

      defoverridable init: 1

      @impl true
      def setup(state) do
        {:ok, state}
      end

      defoverridable setup: 1

      @impl true
      def cast(pid, payload) do
        :ok
      end

      defoverridable cast: 2

      @impl true
      def handle_input(_name, _payload, state) do
        state
      end

      defoverridable handle_input: 3

      def create(%{name: name, opts: opts, connections: connections}) do
        %Block{
          name: name,
          type: __MODULE__,
          opts: opts,
          connections: connections
        }
      end

      def output(state, output_name, payload, opts \\ %{}) do
        opts = Map.merge(%{stream_stop: :send, metadata: %{}}, opts)

        state = send_stream_start(state, output_name)

        Buildel.BlockPubSub.broadcast_to_io(
          state.block.context.context_id,
          state.block.name,
          output_name,
          payload,
          opts.metadata
          |> Map.put_new_lazy(:message_id, fn -> state[:message_id] || UUID.uuid4() end)
        )

        case opts.stream_stop do
          :send -> send_stream_stop(state, output_name)
          :schedule -> schedule_stream_stop(state, output_name)
          :none -> state
        end
      end

      def output_and_wait_for_response(state, output_name, payload, opts \\ %{}) do
        message_id = UUID.uuid4()
        opts = Map.merge(%{stream_stop: :send, metadata: %{}}, opts)

        opts =
          update_in(opts, [:metadata], fn metadata ->
            metadata
            |> Map.put(:message_id, message_id)
          end)

        state = output(state, output_name, payload, opts |> Map.put(:stream_stop, :none))

        response =
          receive do
            {_, payload_type, payload, %{message_id: message_id}} -> {payload_type, payload}
          end

        state =
          case opts.stream_stop do
            :send -> send_stream_stop(state, output_name)
            :schedule -> schedule_stream_stop(state, output_name)
            :none -> state
          end

        {state, response}
      end

      def all_connections(block) do
        block.connections ++ public_connections(block.name)
      end

      def start_link(%{
            block: block,
            context: context
          }) do
        GenServer.start_link(
          __MODULE__,
          %{
            name: context.block_id,
            block_name: block.name,
            context_id: context.context_id,
            type: __MODULE__,
            opts: block.opts,
            connections: block.connections,
            block: block,
            context: context
          },
          name: context.block_id |> String.to_atom()
        )
      end

      def stop(pid) do
        GenServer.stop(pid)
      end

      defdelegate name(pid), to: Block
      defdelegate block_name(pid), to: Block

      @impl true
      def handle_call(:name, _from, state) do
        {:reply, state.block.context.block_id, state}
      end

      def handle_call(:block_name, _from, state) do
        {:reply, state.block.name, state}
      end

      def handle_call(:type, _from, state) do
        {:reply, state.block.type, state}
      end

      @impl true
      def handle_info({_topic, :start_stream, _, _} = message, state) do
        {:noreply, state}
      end

      def handle_info({_topic, :stop_stream, _, _} = message, state) do
        handle_stream_stop(message, state)
      end

      def handle_info({:stop_stream, output}, state) do
        state = send_stream_stop(state, output)
        {:noreply, state}
      end

      def handle_info({topic, message_type, value, metadata} = payload, state) do
        state =
          inputs_subscribed_to_topic(all_connections(state.block), topic)
          |> Enum.reduce(state, fn input, state ->
            handle_input(input.name, payload, state)
          end)

        {:noreply, state}
      end

      defp inputs_subscribed_to_topic(connections, topic) do
        %{block: block, io: output_name} = BlockPubSub.io_from_topic(topic)

        connections
        |> Enum.filter(fn connection ->
          connection.from.block_name == block && connection.from.name == output_name
        end)
        |> Enum.map(& &1.to)
      end

      def handle_stream_stop({_topic, :stop_stream, output, _metadata}, state) do
        {:noreply, state}
      end

      def get_input(input_name) do
        opts = options()
        (opts.inputs ++ opts.ios) |> Enum.find(&(&1.name == input_name))
      end

      def get_output(output_name) do
        opts = options()
        (opts.outputs ++ opts.ios) |> Enum.find(&(&1.name == output_name))
      end

      defoverridable handle_stream_stop: 2

      defp subscribe_to_connections(context_id, connections) do
        connections
        |> Enum.map(fn connection ->
          BlockPubSub.subscribe_to_io(context_id, connection)
        end)
      end

      defp stream_timeout() do
        Application.get_env(:buildel, :stream_timeout, 500)
      end

      defp name_schema() do
        %{
          type: "string",
          title: "Name",
          description:
            "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
          minLength: 2,
          maxLength: 30,
          pattern: "^[^<>: ?-]*$",
          regex: %{
            pattern: "^[^<>: ?-]*$",
            errorMessage: "Invalid string. Characters '< > : - ? ' are not allowed."
          }
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
          },
          "minItems" => 0
        }
      end

      defp tools_schema() do
        %{
          "type" => "array",
          "title" => "Tools",
          "description" => "The tools used in the block.",
          "items" => %{
            "type" => "object",
            "title" => "Tool information",
            "description" => "Information about the tool.",
            "required" => ["name", "type"],
            "properties" => %{
              "name" => %{
                "type" => "string",
                "title" => "Name",
                "description" => "The name of the tool.",
                "minLength" => 2
              },
              "type" => %{
                "type" => "string",
                "title" => "Type",
                "description" => "The type of the tool.",
                "minLength" => 2
              }
            }
          },
          "minItems" => 0
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
            type: "object",
            title: "Options",
            description: "Additional options for the block.",
            required: [],
            properties: %{}
          },
          schema
        )
      end

      defp secret_schema(%{"title" => title, "description" => description}) do
        %{
          "type" => "string",
          "title" => title,
          "description" => description,
          "url" => "/api/organizations/{{organization_id}}/secrets",
          "presentAs" => "async-creatable-select",
          "minLength" => 1,
          "schema" => %{
            "type" => "object",
            "required" => ["name", "value"],
            "properties" => %{
              "name" => %{
                "type" => "string",
                "title" => "Name",
                "description" => "The name for the secret.",
                "minLength" => 1
              },
              "value" => %{
                "type" => "string",
                "title" => "Value",
                "description" => "The value of the secret.",
                "presentAs" => "password",
                "minLength" => 1
              }
            }
          }
        }
      end

      defp memory_schema(
             %{"default" => default, "title" => title, "description" => description} \\ %{
               "default" => "{{pipeline_id}}_{{block_name}}",
               "title" => "Persist in",
               "description" => "Memory collection to use."
             }
           ) do
        %{
          "type" => "string",
          "title" => title,
          "description" => description,
          "url" => "/api/organizations/{{organization_id}}/memory_collections",
          "presentAs" => "async-creatable-select",
          "schema" => %{
            "type" => "object",
            "required" => ["collection_name"],
            "properties" => %{
              "collection_name" => %{
                "type" => "string",
                "title" => "Name",
                "description" => "The name for collection.",
                "minLength" => 1
              },
              "embeddings" => %{
                "type" => "object",
                "title" => "Embeddings",
                "description" => "The embeddings to use for the collection.",
                "required" => ["api_type", "model", "secret_name"],
                "properties" => %{
                  "api_type" => %{
                    "type" => "string",
                    "title" => "API Type",
                    "description" => "The type of the embeddings API.",
                    "enum" => ["openai"],
                    "default" => "openai",
                    "enumPresentAs" => "radio"
                  },
                  "model" => %{
                    "type" => "string",
                    "title" => "Model",
                    "description" => "The model to use for the embeddings.",
                    "url" =>
                      "/api/organizations/{{organization_id}}/models/embeddings?api_type={{embeddings.api_type}}",
                    "presentAs" => "async-select"
                  },
                  "secret_name" =>
                    secret_schema(%{
                      "title" => "Embeddings Secret",
                      "description" => "The secret to use for the embeddings."
                    })
                }
              }
            }
          }
        }
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
          state.context.context_id,
          state.context.block_id,
          output_name,
          message
        )

        state
      end

      def public_connections(block_name) do
        __MODULE__.options().inputs
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

      defp block_secrets_resolver() do
        Application.fetch_env!(:buildel, :block_secrets_resolver)
      end

      defp block_context() do
        Application.fetch_env!(:buildel, :block_context_resolver)
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
              ios: [%{name: String.t(), type: String.t(), public: boolean()}],
              schema: map(),
              description: String.t()
            }
  @callback schema() :: map()
  @callback cast(pid, any()) :: :ok
  @callback setup(any()) :: {:ok, any()} | {:error, any()}
  @callback handle_input(String.t(), {String.t(), atom(), any(), map()}, map()) :: map()
end
