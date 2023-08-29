defmodule Buildel.Clients.ElevenlabsBehaviour do
  @callback synthesize(String.t(), String.t()) :: %HTTPoison.AsyncResponse{}
end

defmodule Buildel.Clients.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  @impl ElevenlabsBehaviour
  def synthesize(text, api_key \\ nil) do
    HTTPoison.post!(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?optimize_streaming_latency=2",
      Jason.encode!(%{
        "text" => text,
        "model_id" => "eleven_monolingual_v1",
        "voice_settings" => %{"stability" => 0, "similarity_boost" => 0}
      }),
      [
        {"Content-Type", "application/json"},
        {"xi-api-key", api_key || System.get_env("ELEVENLABS_API_KEY")}
      ],
      stream_to: self()
    )
  end
end
