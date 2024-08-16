defmodule Buildel.PythonWorker do
  use GenServer

  require Logger

  @timeout 60_000

  def start_link() do
    GenServer.start_link(__MODULE__, nil)
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil)
  end

  def partition_file(filename) do
    Task.async(fn ->
      :poolboy.transaction(
        :python_worker,
        fn pid ->
          GenServer.call(pid, {:partition_file, filename}, @timeout)
        end,
        @timeout
      )
    end)
    |> Task.await(@timeout)
  end

  def partition_url(url) do
    Task.async(fn ->
      :poolboy.transaction(
        :python_worker,
        fn pid ->
          GenServer.call(pid, {:partition_url, url}, @timeout)
        end,
        @timeout
      )
    end)
    |> Task.await(@timeout)
  end

  def reduce_dimensions(collection_name) do
    Task.async(fn ->
      :poolboy.transaction(
        :python_worker,
        fn pid ->
          GenServer.call(pid, {:reduce_dimensions, collection_name}, @timeout)
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
      Logger.debug("[#{__MODULE__}] Started python worker")
      {:ok, pid}
    end
  end

  @impl true
  def handle_call({:partition_file, filename}, _from, pid) do
    result = :python.call(pid, :parse_document, :partition_file, [filename])
    result = Jason.decode!(result)
    Logger.debug("[#{__MODULE__}] Handled call")
    {:reply, {:ok, result}, pid}
  end

  def handle_call({:partition_url, url}, _from, pid) do
    result = :python.call(pid, :parse_document, :partition_url, [url])
    result = Jason.decode!(result)
    Logger.debug("[#{__MODULE__}] Handled call")
    {:reply, {:ok, result}, pid}
  end

  def handle_call({:reduce_dimensions, collection_name}, _from, pid) do
    result = :python.call(pid, :umap_script, :reduce_dimensions, [collection_name])
    IO.inspect("Back to worker")
    Logger.debug("[#{__MODULE__}] Handled call")
    {:reply, {:ok, result}, pid}
  end
end
