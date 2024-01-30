defmodule Buildel.Blocks.CreateBlockTool do
  alias Buildel.Blocks
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  use Buildel.Blocks.Block
  alias LangChain.Function
  use BuildelWeb.Validator
  use Buildel.Blocks.Utils.TakeLatest

  # Config

  @impl true
  defdelegate cast(pid, config), to: __MODULE__, as: :create

  @impl true
  def options() do
    %{
      type: "create_block_tool",
      description: "Used to create block in workflow abc",
      groups: ["el", "tools"],
      inputs: [
        Block.text_input("organization_id"),
        Block.text_input("pipeline_id")
      ],
      outputs: [],
      ios: [Block.io("tool", "worker")],
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
            "required" => [],
            "properties" => Jason.OrderedObject.new([])
          })
      }
    }
  end

  # Client

  def create(pid, arguments) do
    GenServer.cast(pid, {:create_block, arguments})
  end

  def create_sync(pid, arguments) do
    GenServer.call(pid, {:create_block, arguments})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, state |> assign_stream_state(opts) |> assign_take_latest()}
  end

  @impl true
  def handle_cast({:create_block, _arguments}, state) do
    state = state |> send_stream_start()

    # TODO: Add support for async calling

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  defparams(:create_block) do
    required(:block, :map) do
      required(:name, :string)
      required(:type, :string)
      required(:opts, :map)
      optional(:connections, :list, default: [])
      optional(:inputs, :list, default: [])
    end
  end

  @impl true
  def handle_call({:create_block, arguments}, _caller, state) do
    state = state |> send_stream_start()

    with {:ok, organization_id} <- get_input_value(state, "organization_id"),
         {:ok, pipeline_id} <- get_input_value(state, "pipeline_id"),
         {:ok, %{block: block_config}} <- validate(:create_block, arguments),
         block_type when is_atom(block_type) <- Blocks.type(block_config.type),
         :ok <-
           Blocks.validate_block(
             block_type,
             arguments["block"] |> Map.put_new("inputs", []) |> Map.put_new("connections", [])
           ),
         organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.create_block(
             pipeline,
             Map.merge(block_config, %{connections: [], inputs: []})
           ) do
      state = state |> send_stream_stop()
      {:reply, "Created block", state}
    else
      _ ->
        state = state |> send_stream_stop()

        {:reply, "Something went wrong.", state}
    end
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    function =
      Function.new!(%{
        name: "CreateBlock",
        description: "Create block based on provided name, opts and type",
        parameters_schema: %{
          type: "object",
          properties: %{
            block: %{
              type: "object",
              properties: %{
                name: %{
                  type: "string"
                },
                opts: %{
                  type: "object",
                  description: "Block options. See block json schema for more details.",
                  properties: %{},
                  required: []
                },
                type: %{
                  type: "string"
                }
              },
              required: ["name", "type", "opts"]
            }
          },
          required: ["block"]
        },
        function: fn args, _context ->
          create_sync(pid, args)
        end
      })

    {:reply,
     %{
       function: function,
       call_formatter: fn args ->
         "@EL 🗨️: Create block #{args["block"]["name"]}\n"
       end,
       response_formatter: fn response ->
         "@EL 🤖: #{response}\n"
       end
     }, state}
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    state = save_latest_input_value(state, name, message)
    {:noreply, state}
  end
end
