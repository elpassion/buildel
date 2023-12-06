defmodule Buildel.Blocks.WebhookOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_text

  @impl true
  def options() do
    %{
      type: "webhook_output",
      groups: ["inputs / outputs"],
      inputs: [Block.text_input()],
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

    context = block_context().context_from_context_id(context_id) |> Map.put("metadata", state[:opts][:metadata])

    {:ok, state |> Keyword.put(:pid, pid) |> Keyword.put(:context, context) |> assign_stream_state}
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

    payload = %{"content" => content, "topic" => topic, "context" => state[:context]}

    {:ok, token} = Buildel.BlockContext.create_run_auth_token(state[:context_id], "#{state[:context] |> Jason.encode!()}::#{content}")

    webhook().send_content(url, payload, ["Authorization": "Bearer #{token}"])

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  defp webhook() do
    Application.fetch_env!(:buildel, :webhook)
  end
end
