defmodule Buildel.ClientMocks.ClientMock do
  defmacro __using__(_) do
    quote do
      use GenServer

      def set_mock(name, fun, pid \\ self()) do
        GenServer.call(__MODULE__, {:set_mock, pid, name, fun})
      end

      def get_mock(name) do
        pid = Process.get() |> Keyword.get(:"$ancestors", [self()]) |> Enum.at(-1)

        mock =
          GenServer.call(
            __MODULE__,
            {:get_mock, pid, name}
          )
      end

      def start_link(_) do
        GenServer.start_link(__MODULE__, nil, name: __MODULE__)
      end

      def init(_) do
        {:ok,
         %{
           mocks: %{}
         }}
      end

      def handle_call({:set_mock, pid, name, new_mock}, _from, state) do
        state =
          put_in(state, [:mocks, Access.key("#{inspect(pid)}", %{}), Access.key(name)], new_mock)

        {:reply, :ok, state}
      end

      def handle_call({:get_mock, pid, name}, _from, state) do
        {:reply, state.mocks["#{inspect(pid)}"][name], state}
      end
    end
  end
end
