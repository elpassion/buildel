defmodule Buildel.ClientMocks.HttpApi do
  use GenServer

  def request(%Req.Request{} = request) do
    pid = Process.get() |> Keyword.get(:"$ancestors") |> Enum.at(-1)

    mock =
      GenServer.call(
        __MODULE__,
        {:get_mock, pid}
      )

    mock.(request)
  end

  def set_mock(fun) do
    GenServer.call(__MODULE__, {:set_mock, self(), fun})
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_) do
    {:ok,
     %{
       mock: %{}
     }}
  end

  def handle_call({:set_mock, pid, new_mock}, _from, state) do
    state =
      put_in(state.mock["#{inspect(pid)}"], new_mock)

    {:reply, :ok, state}
  end

  def handle_call({:get_mock, pid}, _from, state) do
    {:reply, state.mock["#{inspect(pid)}"], state}
  end
end
