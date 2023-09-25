defmodule Buildel.DocumentCache do
  use Agent

  def start_link(_) do
    start_link()
  end

  def start_link() do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def get(key) do
    Agent.get(__MODULE__, fn state -> Map.get(state, key) end)
  end

  def put(key, value) do
    Agent.update(__MODULE__, fn state -> Map.put(state, key, value) end)
    value
  end

  def delete(key) do
    Agent.update(__MODULE__, fn state -> Map.delete(state, key) end)
  end
end
