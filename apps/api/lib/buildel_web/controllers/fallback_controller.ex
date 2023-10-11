defmodule BuildelWeb.FallbackController do
  use BuildelWeb, :controller
  require Logger

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: BuildelWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  # This clause is an example of how to handle resources that cannot be found.
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(html: BuildelWeb.ErrorHTML, json: BuildelWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(html: BuildelWeb.ErrorHTML, json: BuildelWeb.ErrorJSON)
    |> render(:"401")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(html: BuildelWeb.ErrorHTML, json: BuildelWeb.ErrorJSON)
    |> render(:"403")
  end

  def call(conn, {:error, :invalid_id}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(html: BuildelWeb.ErrorHTML, json: BuildelWeb.ErrorJSON)
    |> render(:"422")
  end

  def call(conn, error) do
    Logger.error("Unhandled error: #{inspect(error)}")
    conn
    |> put_status(:internal_server_error)
    |> put_view(html: BuildelWeb.ErrorHTML, json: BuildelWeb.ErrorJSON)
    |> render(:"500")
  end
end
