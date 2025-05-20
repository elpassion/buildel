defmodule Buildel.ClientMocks.Openai do
  alias Buildel.Clients.OpenaiBehaviour
  @behaviour OpenaiBehaviour

  defstruct [:token]

  def new(token) do
    %__MODULE__{
      token: token
    }
  end

  @impl OpenaiBehaviour
  def transcribe_audio(%__MODULE__{token: _token}, {:binary, _audio}, _params) do
    {:ok, "Hello"}
  end
end
