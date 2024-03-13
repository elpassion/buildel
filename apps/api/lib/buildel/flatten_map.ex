defmodule Buildel.FlattenMap do
  def flatten(m, delimeter \\ ".")

  def flatten(m, delimeter) when is_map(m) do
    for {k, v} <- m, sk = to_string(k), fv <- flatten(v, delimeter), into: %{} do
      case fv do
        {key, val} -> {sk <> delimeter <> key, val}
        val -> {sk, val}
      end
    end
  end

  def flatten(v, _delimeter), do: [v]
end
