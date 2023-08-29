defmodule Buildel.ClientMocks.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  @impl ElevenlabsBehaviour
  def synthesize(_text, _api_key) do
    response = %HTTPoison.AsyncResponse{id: make_ref()}
    send(self(), %HTTPoison.AsyncStatus{id: response.id})
    send(self(), %HTTPoison.AsyncHeaders{})

    send(self(), %HTTPoison.AsyncChunk{
      id: response.id,
      chunk: File.read!("test/support/fixtures/real.mp3")
    })

    send(self(), %HTTPoison.AsyncEnd{id: response.id})
    response
  end
end
