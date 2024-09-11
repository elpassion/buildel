defmodule Buildel.MemoriesAccess do
  use GenServer

  defmodule State do
    defstruct chunks: %{}

    defmodule Chunk do
      defstruct [:memory_id, :chunk_id, :document]
    end

    def new(chunks \\ %{}) do
      %State{chunks: chunks}
    end

    def add(%State{} = state, id, %Chunk{} = chunk) do
      %{state | chunks: state.chunks |> Map.put(id, chunk)}
    end

    def remove(%State{} = state, id) do
      %{state | chunks: state.chunks |> Map.delete(id)}
    end
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_args) do
    {:ok, State.new()}
  end

  def get_state(id) do
    GenServer.call(__MODULE__, {:get, id})
  end

  def add_chunk(attrs) do
    temporary_id = Nanoid.generate(8)
    GenServer.cast(__MODULE__, {:add, temporary_id, struct(State.Chunk, attrs)})

    {:ok, temporary_id}
  end

  ########

  def handle_cast({:add, temporary_id, %State.Chunk{} = chunk}, state) do
    state = state |> State.add(temporary_id, chunk)

    Process.send_after(self(), {:remove, temporary_id}, 1000 * 60 * 60)

    {:noreply, state}
  end

  def handle_info({:remove, id}, state) do
    state = state |> State.remove(id)

    {:noreply, state}
  end

  def handle_call({:get, id}, _, state) do
    response =
      case state.chunks |> Map.get(id) do
        nil -> {:error, :not_found}
        chunk -> {:ok, chunk}
      end

    {:reply, response, state}
  end
end
