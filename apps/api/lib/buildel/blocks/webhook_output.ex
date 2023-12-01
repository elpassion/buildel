defmodule Buildel.Blocks.WebhookOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :send_text
  defdelegate text_output(name, public), to: Buildel.Blocks.Block
  defdelegate text_input(), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "webhook_output",
      groups: ["inputs / outputs"],
      inputs: [text_input()],
      outputs: [],
      ios: [],
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
            "required" => ["url"],
            "properties" => %{
              "url" => %{
                "type" => "string",
                "title" => "Webhook url",
                "description" => "URL to which the block will send data."
              }
            }
          })
      }
    }
  end

  # Client

  def send_text(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:send_text, text})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    pid = opts[:pid] || self()

    {:ok, state |> Keyword.put(:pid, pid) |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_text, {:text, content}}, state) do
    state = state |> send_stream_start()

    url = state |> get_in([:opts, :url])

    topic =
      Buildel.BlockPubSub.io_topic(
        state[:context_id],
        state[:block_name],
        "output"
      )

    context = block_context().context_from_context_id(state[:context_id])

    payload = %{"content" => content, "topic" => topic, "context" => context}

    webhook().send_content(state[:pid], url, payload)

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})
    {:noreply, state}
  end

  defp webhook() do
    Application.fetch_env!(:buildel, :webhook)
  end

  defp block_context() do
    Application.fetch_env!(:buildel, :block_context_resolver)
  end
end
