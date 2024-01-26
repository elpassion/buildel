defmodule Buildel.Blocks.CreateBlockTool do
  alias LangChain.FunctionParam
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  use Buildel.Blocks.Block
  alias LangChain.Function
  use BuildelWeb.Validator

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :create

  @impl true
  def options() do
    %{
      type: "create_block_tool",
      description: "Used to create block in workflow abc",
      groups: ["el", "tools"],
      inputs: [],
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

    {:ok, state |> assign_stream_state(opts)}
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

    with {:ok, %{block: block_config}} <-
           validate(:create_block, arguments),
         organization <- Buildel.Organizations.get_organization!("4"),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, "31"),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.create_block(
             pipeline,
             Map.merge(block_config, %{connections: [], inputs: []})
           ) do
      {:reply, "Created block", state}
    else
      _ -> {:reply, "Something went wrong.", state}
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
                  properties: %{
                    description: %{
                      type: "string"
                    }
                  },
                  required: ["description"]
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

    {:reply, function, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
