defmodule Buildel.BlocksTestRunner do
  alias Buildel.BlocksTestRunner.Run
  alias Buildel.Blocks.Block

  use GenServer

  def start_run(config) do
    {:ok, pid} = GenServer.start_link(__MODULE__, config)

    {:ok, %Run{pid: pid}}
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
