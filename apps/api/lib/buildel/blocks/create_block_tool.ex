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
    state = send_stream_start(state)

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
      state = state |> send_stream_stop()
      {"Created block", state}
    else
      err ->
        Logger.error("Error creating block: #{inspect(err)}")
        state = state |> send_stream_stop()

        {"Something went wrong. Could not create block because #{inspect(err)}", state}
    end
  end

  def connect_blocks(state, arguments) do
    state = send_stream_start(state)

    with {:ok, organization_id} <- {:ok, state.context.context.global},
         {:ok, pipeline_id} <- {:ok, state.opts.metadata["pipeline_id"]},
         organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.create_connection(pipeline, arguments["from"], arguments["to"]) do
      state = state |> send_stream_stop()
      {"Connected blocks", state}
    else
      err ->
        Logger.error("Error creating block: #{inspect(err)}")
        state = state |> send_stream_stop()

        {"Something went wrong. Could not connect blocks because #{inspect(err)}", state}
    end
  end

  def disconnect_blocks(state, arguments) do
    state = send_stream_start(state)

    with {:ok, organization_id} <- {:ok, state.context.context.global},
         {:ok, pipeline_id} <- {:ok, state.opts.metadata["pipeline_id"]},
         organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.remove_connection(pipeline, arguments["from"], arguments["to"]) do
      state = state |> send_stream_stop()
      {"Disconnected blocks", state}
    else
      err ->
        Logger.error("Error creating block: #{inspect(err)}")
        state = state |> send_stream_stop()

        {"Something went wrong. Could not disconnect blocks because #{inspect(err)}", state}
    end
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "GetCurrentWorkflow",
          description:
            "Get workflow configuration. Returns what blocks are in the workflow and how are they connected.",
          parameters_schema: %{
            type: "object",
            properties: %{},
            required: []
          }
        },
        call_formatter: fn args ->
          _args = %{"config.args" => args, "config.block_name" => state.block.name}
          "@EL 🗨️: Retrieving current workflow\n"
        end,
        response_formatter: fn _response ->
          "@EL 🤖: Got the workflow!\n"
        end
      },
      %{
        function: %{
          name: "CreateBlock",
          description: "Create block based on provided name, opts and type.",
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
      },
      %{
        function: %{
          name: "ConnectBlocks",
          description:
            "Create a connection between blocks input and output. output_name and input_name are taken from options in block details. If you want to connect blocks as a tool for chat then you SHOULD use the IO input and output. It is usually called \"tool\" and THE CONNECTION IS ALWAYS from \"worker\" to \"controller\".",
          parameters_schema: %{
            type: "object",
            properties: %{
              from: %{
                type: "object",
                properties: %{
                  block_name: %{type: "string"},
                  output_name: %{type: "string"}
                },
                required: ["block_name", "output_name"]
              },
              to: %{
                type: "object",
                properties: %{
                  block_name: %{type: "string"},
                  input_name: %{type: "string"}
                },
                required: ["block_name", "input_name"]
              }
            },
            required: ["from", "to"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}

          "@EL 🗨️: Create connection #{args["config.args"]["from"]["block_name"]}:#{args["config.args"]["from"]["output_name"]} - #{args["config.args"]["to"]["block_name"]}:#{args["config.args"]["to"]["input_name"]}\n"
        end,
        response_formatter: fn response ->
          "@EL 🤖: #{response}!\n"
        end
      },
      %{
        function: %{
          name: "DisconnectBlocks",
          description:
            "Removes a connection between blocks input and output. output_name and input_name are taken from options in block details.",
          parameters_schema: %{
            type: "object",
            properties: %{
              from: %{
                type: "object",
                properties: %{
                  block_name: %{type: "string"},
                  output_name: %{type: "string"}
                },
                required: ["block_name", "output_name"]
              },
              to: %{
                type: "object",
                properties: %{
                  block_name: %{type: "string"},
                  input_name: %{type: "string"}
                },
                required: ["block_name", "input_name"]
              }
            },
            required: ["from", "to"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}

          "@EL 🗨️: Remove connection #{args["config.args"]["from"]["block_name"]}:#{args["config.args"]["from"]["output_name"]} - #{args["config.args"]["to"]["block_name"]}:#{args["config.args"]["to"]["input_name"]}\n"
        end,
        response_formatter: fn response ->
          "@EL 🤖: #{response}!\n"
        end
      }
    ]
  end

  @impl true
  def handle_tool("tool", "CreateBlock", {_name, :text, args, _metadata}, state) do
    create_block(state, args)
  end

  @impl true
  def handle_tool("tool", "DisconnectBlocks", {_name, :text, args, _metadata}, state) do
    disconnect_blocks(state, args)
  end

  @impl true
  def handle_tool("tool", "ConnectBlocks", {_name, :text, args, _metadata}, state) do
    connect_blocks(state, args)
  end

  @impl true
  def handle_tool("tool", "GetCurrentWorkflow", {_name, :text, _args, _metadata}, state) do
    state = send_stream_start(state)

    with {:ok, organization_id} <- {:ok, state.context.context.global},
         {:ok, pipeline_id} <- {:ok, state.opts.metadata["pipeline_id"]},
         organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id) do
      state = send_stream_stop(state)

      {pipeline.config |> Jason.encode!(), state}
    end
  end
end
