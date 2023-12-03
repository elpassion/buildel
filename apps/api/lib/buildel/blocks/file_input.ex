defmodule Buildel.Blocks.FileInput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_file

  @impl true
  def options() do
    %{
      type: "file_input",
      groups: ["file", "inputs / outputs"],
      inputs: [Block.file_input("input", true)],
      outputs: [Block.file_output()],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema()
      }
    }
  end

  # Client

  def send_file(pid, {:binary, _chunk} = audio) do
    GenServer.cast(pid, {:send_file, audio})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: _opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, ["#{block_name}:input"])

    {:ok, state |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_file, {:binary, _chunk} = file}, state) do
    state = send_stream_start(state)

    BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      file
    )

    state = schedule_stream_stop(state)

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, chunk}, state) do
    cast(self(), {:binary, chunk})
    {:noreply, state}
  end
end
