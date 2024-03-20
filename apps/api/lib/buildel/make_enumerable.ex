defmodule MakeEnumerable do
  @moduledoc """

    Makes your structures enumerable!

    The `MakeEnumerable` module injects `defimpl Enumerable` for your structs,
    as structs are basically `maps` with special tag (member) `__struct__`.
    The module hides the tag `__struct__` and delegates all other members
    to map to be `Enumerable`.


    ```
    defmodule Bar do
      use MakeEnumerable
      defstruct foo: "a", baz: 10
    end

    iex> import Bar
    iex> Enum.map(%Bar{}, fn({k, v}) -> {k, v} end)
    [baz: 10, foo: "a"]
    ```

  """

  defmacro __using__(_options) do
    quote do
      import unquote(__MODULE__)
      @before_compile unquote(__MODULE__)
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      defimpl Enumerable, for: __MODULE__ do
        def count(field) do
          map = field |> Map.from_struct()
          {:ok, map_size(map)}
        end

        def member?(field, {key, value}) do
          map = field |> Map.from_struct()
          {:ok, match?(%{^key => ^value}, map)}
        end

        def member?(_field, _other) do
          {:ok, false}
        end

        def slice(field) do
          map = field |> Map.from_struct()
          size = map_size(map)
          {:ok, size, &:maps.to_list/1}
        end

        def reduce(field, acc, fun) do
          map = field |> Map.from_struct()
          Enumerable.List.reduce(:maps.to_list(map), acc, fun)
        end
      end
    end
  end
end
