defmodule Buildel.Blocks.CreateBlockTool do
  alias Buildel.Blocks
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool
  use BuildelWeb.Validator
  require Logger

  # Config

  @impl true
  defdelegate cast(pid, config), to: __MODULE__, as: :create

  @impl true
  def options() do
    %{
      type: "create_block_tool",
      description: "Used to create block in workflow abc.",
      groups: ["el", "tools"],
      inputs: [],
      outputs: [],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
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
  def setup(%{type: __MODULE__, block_name: block_name} = state) do
    if state.opts.metadata["pipeline_id"] do
      {:ok, state}
    else
      {:stop, {:error, block_name, :pipeline_id_is_required}}
    end
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

  def create_block(state, arguments) do
    with {:ok, organization_id} <- {:ok, state.context.context.global},
         {:ok, pipeline_id} <- {:ok, state.opts.metadata["pipeline_id"]},
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
      {"Created block", state}
    else
      err ->
        Logger.error("Error creating block: #{inspect(err)}")
        state = state |> send_stream_stop()

        {"Something went wrong.", state}
    end
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
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
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          "@EL 🗨️: Create block #{args["block"]["name"]}\n"
        end,
        response_formatter: fn response ->
          "@EL 🤖: #{response}\n"
        end
      }
    ]
  end

  @impl true
  def handle_tool("tool", "CreateBlock", {_name, :text, args, _metadata}, state) do
    create_block(state, args)
  end
end
