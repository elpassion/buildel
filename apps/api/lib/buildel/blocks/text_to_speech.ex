defmodule Buildel.Blocks.TextToSpeech do
  use Buildel.Blocks.Block

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :synthesize
  defdelegate audio_output(), to: Buildel.Blocks.Block
  defdelegate text_input(), to: Buildel.Blocks.Block

  # Config
  @impl true
  def options() do
    %{
      type: "text_to_speech",
      groups: ["text", "audio"],
      inputs: [text_input()],
      outputs: [audio_output()],
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
            "required" => ["api_key"],
            "properties" => %{
              api_key: %{
                "type" => "string",
                "title" => "API key",
                "url" => "/api/organizations/{{organization_id}}/secrets",
                "presentAs" => "async-creatable-select",
                "schema" => %{
                  "type" => "object",
                  "required" => ["name", "value"],
                  "properties" => %{
                    "name" => %{
                      "type" => "string",
                      "title" => "Name",
                      "description" => "The name for the secret.",
                      "minLength" => 1
                    },
                    "value" => %{
                      "type" => "string",
                      "title" => "Value",
                      "description" => "The value of the secret.",
                      "presentAs" => "password",
                      "minLength" => 1
                    }
                  }
                },
                "description" => "ElevenLabs API Key."
              }
            }
          })
      }
    }
  end

  # Client

  def synthesize(pid, {:text, _text} = message) do
    GenServer.cast(pid, {:synthesize, message})
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

    {:ok,
     state
     |> Keyword.put(
       :api_key,
       block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))
     )
     |> Keyword.put(:clips, %{})
     |> assign_stream_state()}
  end

  @impl true
  def handle_cast({:synthesize, {:text, text}}, state) do
    state = state |> send_stream_start()
    elevenlabs().synthesize(text, state[:api_key])

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    synthesize(self(), {:text, text})
    {:noreply, state}
  end

  def handle_info(%HTTPoison.AsyncStatus{id: ref}, state) do
    id = ref_to_atom(ref)
    state = put_in(state[:clips][id], %{id: id, chunks: [], finished: false})
    {:noreply, state}
  end

  def handle_info(%HTTPoison.AsyncHeaders{}, state), do: {:noreply, state}

  def handle_info(%HTTPoison.AsyncChunk{id: ref, chunk: chunk}, state) do
    id = ref_to_atom(ref)
    state = put_in(state[:clips][id][:chunks], state[:clips][id][:chunks] ++ [chunk])
    {:noreply, state}
  end

  def handle_info(%HTTPoison.AsyncEnd{id: ref}, state) do
    id = ref_to_atom(ref)
    state = put_in(state[:clips][id][:finished], true)
    state = drain_oldest_clip(state)
    {:noreply, state}
  end

  defp ref_to_atom(ref) do
    ref |> :erlang.ref_to_list() |> List.to_string() |> String.to_atom()
  end

  defp drain_oldest_clip(state) do
    oldest_clip_id = state[:clips] |> Map.keys() |> List.first()

    if oldest_clip_id == nil do
      state
    else
      file =
        state[:clips][oldest_clip_id][:chunks]
        |> Enum.reduce(<<>>, fn chunk, acc -> acc <> chunk end)

      if file == <<>> do
        if state[:clips][oldest_clip_id][:finished],
          do:
            update_in(state[:clips], fn clips -> clips |> Map.delete(oldest_clip_id) end)
            |> drain_oldest_clip,
          else: state
      else
        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "output",
          {:binary, file}
        )

        state = put_in(state[:clips][oldest_clip_id][:chunks], [])

        if state[:clips][oldest_clip_id][:finished],
          do:
            update_in(state[:clips], fn clips -> clips |> Map.delete(oldest_clip_id) end)
            |> drain_oldest_clip,
          else: state
      end
    end
    |> send_stream_stop()
  end

  defp elevenlabs() do
    Application.fetch_env!(:buildel, :elevenlabs)
  end

  defp block_secrets_resolver() do
    Application.fetch_env!(:buildel, :block_secrets_resolver)
  end
end
