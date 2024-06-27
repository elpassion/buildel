defmodule Buildel.Cache do
  use GenServer

  # client
  def start_link(state \\ []) do
    GenServer.start_link(__MODULE__, state, name: __MODULE__)
  end

  def lookup(key, f) when is_binary(key) do
    case :ets.lookup(:buildel_cache, key) do
      [] ->
        result = f.()

        if result |> :erlang.term_to_binary() |> :erlang.byte_size() < 1000 * 1024 do
          :ets.insert(:buildel_cache, {key, result})
        end

        result

      [{_key, value}] ->
        value
    end
  end

  # server
  def init(state) do
    :ets.new(:buildel_cache, [
      :set,
      :named_table,
      :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    # do not block the init
    {:ok, state, {:continue, :get_from_db}}
  end

  def handle_continue(:get_from_db, state) do
    {:noreply, state}
  end
end
