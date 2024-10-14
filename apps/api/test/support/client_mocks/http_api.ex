defmodule Buildel.ClientMocks.HttpApi do
  use GenServer

  def request(%Req.Request{} = request) do
    mock = GenServer.call(__MODULE__, :get_mock)
    mock.(request)
  end

  def set_mock(fun) do
    GenServer.call(__MODULE__, {:set_mock, fun})
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_) do
    {:ok,
     %{
       mock: fn _request ->
         %Req.Response{status: 200}
       end
     }}
  end

  def handle_call({:set_mock, new_mock}, _from, state) do
    state =
      put_in(state.mock, new_mock)

    {:reply, :ok, state}
  end

  def handle_call(:get_mock, _from, state) do
    {:reply, state.mock, state}
  end
end
