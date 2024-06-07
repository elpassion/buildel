defmodule Buildel.Blocks.Browser do
  use Buildel.Blocks.Block

  alias Buildel.Crawler
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :url

  @impl true
  def options() do
    %{
      type: "browser",
      description: "Used for browsing a website and extracting information",
      groups: ["tools"],
      inputs: [
        Block.text_input("url")
      ],
      outputs: [Block.text_output(), Block.file_output("file_output")],
      ios: [Block.io("tool", "worker")],
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
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => %{}
          })
      }
    }
  end

  # Client

  def url(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:url, text})
  end

  def url_sync(pid, {:text, _text} = text) do
    GenServer.call(pid, {:url, text})
  end

  # Server

  @impl true
  def init(
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    subscribe_to_connections(
      context_id,
      state.connections ++ public_connections(state.block.name)
    )

    {:ok,
     state
     |> assign_stream_state()
     |> Map.put(
       :call_formatter,
       opts |> Map.get(:call_formatter, "Browse 📑: \"{{config.args}}\"\n")
     )}
  end

  @impl true
  def handle_cast({:url, {:text, url}}, state) do
    state = send_stream_start(state)

    uri = URI.parse(url)

    with {:ok, crawl} when length(crawl.pages) != 0 <-
           Crawler.crawl(url,
             max_depth: 1,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ),
         {:ok, path} <- Temp.path(%{suffix: ".html"}),
         :ok <- File.write(path, List.first(crawl.pages).body),
         workflow <- Buildel.DocumentWorkflow.new(),
         document when is_list(document) <-
           Buildel.DocumentWorkflow.read(workflow, {path, %{type: "text/html"}}) do
      content =
        Buildel.DocumentWorkflow.build_node_chunks(workflow, document)
        |> Enum.map(&Map.get(&1, :value))
        |> Enum.join(" ")

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text, content}
      )

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "file_output",
        {:binary, path},
        %{
          file_id: UUID.uuid4(),
          file_name: url,
          file_type: "text/html"
        }
      )

      state = send_stream_stop(state)

      {:noreply, state}
    else
      {:error, %Crawler.Crawl{} = crawl} ->
        send_error(state, crawl.error)
        state = state |> schedule_stream_stop()
        {:noreply, state}

      {:ok, %Crawler.Crawl{}} ->
        send_error(state, "No content found")
        state = state |> schedule_stream_stop()
        {:noreply, state}

      {:error, reason} ->
        send_error(state, reason)
        state = state |> send_stream_stop()
        {:noreply, state}

      _ ->
        send_error(state, "Unknown error")
        state = state |> send_stream_stop()
        {:noreply, state}
    end
  end

  @impl true
  def handle_call({:url, {:text, url}}, _caller, state) do
    state = send_stream_start(state)

    uri = URI.parse(url)

    with {:ok, crawl} when length(crawl.pages) != 0 <-
           Crawler.crawl(url,
             max_depth: 1,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ),
         {:ok, path} <- Temp.path(%{suffix: ".html"}),
         :ok <- File.write(path, List.first(crawl.pages).body),
         workflow <- Buildel.DocumentWorkflow.new(),
         document when is_list(document) <-
           Buildel.DocumentWorkflow.read(workflow, {path, %{type: "text/html"}}) do
      content =
        Buildel.DocumentWorkflow.build_node_chunks(workflow, document)
        |> Enum.map(&Map.get(&1, :value))
        |> Enum.join(" ")

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text, content}
      )

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "file_output",
        {:binary, path},
        %{
          file_id: UUID.uuid4(),
          file_name: url,
          file_type: "text/html"
        }
      )

      state = state |> schedule_stream_stop()
      {:reply, content, state}
    else
      {:error, %Crawler.Crawl{} = crawl} ->
        send_error(state, crawl.error)
        state = state |> schedule_stream_stop()
        {:reply, to_string(crawl.error), state}

      {:ok, %Crawler.Crawl{}} ->
        send_error(state, "No content found")
        state = state |> schedule_stream_stop()
        {:noreply, state}

      {:error, reason} ->
        send_error(state, reason)
        state = state |> schedule_stream_stop()
        {:reply, reason, state}

      _ ->
        send_error(state, "Unknown error")
        state = state |> schedule_stream_stop()
        {:reply, "Unknown error", state}
    end
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    description = "Browse a website and extract information."

    function =
      Function.new!(%{
        name: "url",
        description: description,
        parameters_schema: %{
          type: "object",
          properties: %{
            url: %{
              type: "string",
              description: "The URL to browse."
            }
          },
          required: ["url"]
        },
        function: fn %{"url" => url} = _args, _context ->
          url_sync(pid, {:text, url})
        end
      })

    {:reply,
     %{
       function: function,
       call_formatter: fn args ->
         args = %{"config.args" => args, "config.block_name" => state.block.name}
         build_call_formatter(state.call_formatter, args)
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
  end

  @impl true
  def handle_info({_name, :text, text, _metadata}, state) do
    cast(self(), {:text, text})

    {:noreply, state}
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
