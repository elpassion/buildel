defmodule BuildelWeb.CalculatorController do
  use Phoenix.Controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  defparams :add do
    required(:left, :integer)
    required(:right, :integer)
  end

  def add(conn, params) do
    with {:ok, params} <- validate(:add, params) do
      conn |> put_status(:ok) |> json(%{result: params.left + params.right})
    end
  end
end
