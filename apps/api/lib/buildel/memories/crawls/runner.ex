defmodule Buildel.Memories.Crawls.Runner do
  alias Buildel.Memories.Crawls.Runner.Worker

  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  def poolboy_config do
    [
      name: {:local, :worker_crawl},
      worker_module: Buildel.Memories.Crawls.Runner.Worker,
      size: 20,
      max_overflow: 2
    ]
  end

  def run(organization, collection, data) when is_list(data) do
    GenServer.call(__MODULE__, {:run, organization, collection, data})
  end

  def get_remaining_tasks(collection_id) do
    GenServer.call(__MODULE__, {:get_remaining_tasks, collection_id})
  end

  @impl true
  def init(_) do
    {:ok, %{tasks: %{}}}
  end

  @impl true
  def handle_call({:run, _organization, _collection, []}, _from, state), do: {:reply, :ok, state}

  @impl true
  def handle_call({:run, organization, collection, data}, _from, state) do
    tasks =
      data
      |> Enum.map(fn url ->
        task =
          Task.Supervisor.async_nolink(Buildel.TaskSupervisor, fn ->
            Worker.run(url, organization, collection)
          end)

        {task.ref, {collection.id, url}}
      end)
      |> Map.new()

    state = update_in(state.tasks, &Map.merge(&1, tasks))

    {:reply, :ok, state}
  end

  def handle_call({:get_remaining_tasks, collection_id}, _from, state) do
    {:reply, remaining_crawl_tasks(state.tasks, collection_id), state}
  end

  @impl true
  def handle_info({ref, :ok}, state) do
    {_collection_id, state} = cleanup_task(state, ref)

    {:noreply, state}
  end

  def handle_info({:DOWN, ref, _, _, _reason}, state) do
    {_collection_id, state} = cleanup_task(state, ref)

    {:noreply, state}
  end

  defp remaining_crawl_tasks(tasks, collection_id),
    do: Enum.filter(tasks, fn {_, {id, _}} -> id == collection_id end)

  defp cleanup_task(state, ref) do
    Process.demonitor(ref, [:flush])

    pop_in(state.tasks[ref])
  end

  defmodule Worker do
    alias Buildel.Crawler

    use GenServer

    @wait_timeout 300_000
    @work_timeout 60_000

    def start_link(_) do
      GenServer.start_link(__MODULE__, nil)
    end

    def run(url, organization, collection) do
      :poolboy.transaction(
        :worker_crawl,
        fn pid ->
          GenServer.call(
            pid,
            {:run, url, organization, collection},
            @work_timeout
          )
        end,
        @wait_timeout
      )
    end

    @impl true
    def init(_) do
      {:ok, nil}
    end

    @impl true
    def handle_call({:run, url, organization, collection}, _from, state) do
      uri = URI.parse(url)

      case Crawler.crawl(url,
             max_depth: 1,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ) do
        {:ok, crawl} ->
          crawl.pages
          |> Enum.map(&process_page(&1, organization, collection))

        _ ->
          :error
      end

      {:reply, :ok, state}
    end

    @impl true
    def handle_info(_, state) do
      {:noreply, state}
    end

    defp process_page(page, organization, collection) do
      # html instead of markdown because https://github.com/nlmatics/nlm-ingestor/issues/83
      path = Temp.path!(%{suffix: ".html"})
      # page.body |> Html2Markdown.convert()
      File.write!(path, page.body)

      Buildel.Memories.create_organization_memory(organization, collection, %{
        path: path,
        type: "text/html",
        name: page.url
      })
    end
  end
end
