defmodule Buildel.BlocksTestRunner do
  alias Buildel.BlocksTestRunner.Run
  alias Buildel.Blocks.Block

  use GenServer

  def start_run(config) do
    config = add_test_inputs(config)
    {:ok, pid} = GenServer.start_link(__MODULE__, config)

    {:ok, %Run{pid: pid, config: config}}
  end

  def block_id(context, block) do
    "#{context}::#{block.name}"
  end

  def context_id(pid) do
    "#{inspect(pid)}"
  end

  def context_from_context_id(context_id) do
    %{
      global: context_id,
      parent: context_id,
      local: context_id
    }
  end

  def create_test_text_input_block(name) do
    Buildel.Blocks.TextInput.create(%{
      name: name,
      opts: %{},
      connections: []
    })
  end

  def create_test_file_input_block(name) do
    Buildel.Blocks.FileInput.create(%{
      name: name,
      opts: %{},
      connections: []
    })
  end

  def create_test_audio_input_block(name) do
    Buildel.Blocks.AudioInput.create(%{
      name: name,
      opts: %{},
      connections: []
    })
  end

  def test_text_input_connection(input_name) when is_atom(input_name),
    do: test_text_input_connection(input_name |> to_string())

  def test_text_input_connection(input_name),
    do:
      Buildel.Blocks.Connection.from_connection_string(
        "TEST_INPUT:output->#{input_name}",
        "text"
      )

  def test_text_input(run, message),
    do: Run.input(run, "TEST_INPUT", :input, message)

  def subscribe_to_block(run, block_name) do
    with %Buildel.Blocks.Block{} = block <-
           run.config.blocks |> Enum.find(&(&1.name == block_name)) do
      {:ok, block_topic} = Run.subscribe_to_block(run, block_name)

      subscriptions =
        block.type.outputs()
        |> Enum.map(fn output ->
          {:ok, topic} = Run.subscribe_to_output(run, block_name, output.name)
          {"#{block_name}_#{output.name}", topic}
        end)
        |> Enum.into(%{})
        |> Map.put(block_name, block_topic)

      run |> Run.add_subscriptions(subscriptions)
    else
      nil ->
        throw("Can't find block #{block_name}")
    end
  end

  defp add_test_inputs(config) do
    update_in(config.blocks, fn blocks ->
      blocks ++
        [
          Buildel.Blocks.NewRawInput.create(%{
            name: "TEST_INPUT",
            opts: %{},
            connections: []
          })
        ]
    end)
  end

  @impl true
  def init(config) do
    context_id = context_id(self())

    children =
      for %Block{type: type} = block <- config.blocks do
        block_id =
          block_id(context_id(self()), block)

        context =
          %{
            block_id: block_id,
            context_id: context_id,
            context: context_from_context_id(context_id)
          }

        %{
          id: block_id |> String.to_atom(),
          start:
            {type, :start_link,
             [
               %{
                 block: block |> Block.set_context(context),
                 context: context
               }
             ]}
        }
      end

    {:ok, _} = Supervisor.start_link(children, strategy: :one_for_one)

    {:ok, config}
  end
end
