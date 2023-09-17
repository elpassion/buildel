defmodule Buildel.PythonWorker do
  use GenServer

  require Logger

  @timeout 10_000

  def start_link() do
    GenServer.start_link(__MODULE__, nil)
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil)
  end

  def message(pid, my_string) do
    GenServer.call(pid, {:hello, my_string})
  end

  def partition_file(filename) do
    Task.async(fn ->
      :poolboy.transaction(
        :python_worker,
        fn pid ->
          GenServer.call(pid, {:partition_file, filename})
        end,
        @timeout
      )
    end)
    |> Task.await(@timeout)
  end

  #############
  # Callbacks #
  #############

  @impl true
  def init(_) do
    path =
      [:code.priv_dir(:buildel), "python"]
      |> Path.join()

    with {:ok, pid} <- :python.start([{:python_path, to_charlist(path)}, {:python, ~c"python3"}]) do
      Logger.info("[#{__MODULE__}] Started python worker")
      {:ok, pid}
    end
  end

  @impl true
  def handle_call({:partition_file, filename}, _from, pid) do
    result = :python.call(pid, :python_message, :partition_file, [filename])
    Logger.info("[#{__MODULE__}] Handled call")
    {:reply, {:ok, result}, pid}
  end
end
