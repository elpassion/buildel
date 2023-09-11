defmodule BuildelWeb.Validator do
  defmacro __using__(_opts) do
    quote do
      use Goal

      defp changeset_error(errors) do
        %Ecto.Changeset{
          action: :validate,
          errors: errors |> Enum.map(fn {key, value} -> {key, {value, []}} end) |> Enum.into(%{}),
          changes: %{},
          types: %{}
        }
      end
    end
  end
end
