defmodule BuildelWeb.SubscriptionsAuth do
  import Plug.Conn
  import Phoenix.Controller

  def verify_stripe_webhook(conn, _opts) do
    raw_body = conn.assigns[:raw_body] || ""

    with {:ok, timestamp, signature} <- get_stripe_signature(conn),
         {:ok, _} <- verify_signature(raw_body, timestamp, signature) do
      conn
    else
      _ ->
        conn
        |> maybe_store_return_to()
        |> put_status(:unauthorized)
        |> put_view(BuildelWeb.ErrorJSON)
        |> render("401.json")
        |> halt()
    end
  end

  defp get_stripe_signature(conn) do
    case get_req_header(conn, "stripe-signature") do
      [signature_header] ->
        regex = ~r/t=(?<timestamp>\d+),v1=(?<v1_signature>[^,]+)/

        case Regex.named_captures(regex, signature_header) do
          %{"timestamp" => timestamp, "v1_signature" => signature} ->
            {:ok, timestamp, signature}

          _ ->
            {:error, :invalid_signature_header}
        end

      _ ->
        {:error, :missing_signature_header}
    end
  end

  defp verify_signature(payload, timestamp, stripe_signature) do
    signed_payload = "#{timestamp}.#{payload}"

    computed_signature =
      :crypto.mac(
        :hmac,
        :sha256,
        Application.get_env(:buildel, :stripe_webhook_secret),
        signed_payload
      )
      |> Base.encode16(case: :lower)

    if Plug.Crypto.secure_compare(computed_signature, stripe_signature) do
      {:ok, :valid_signature}
    else
      {:error, :invalid_signature}
    end
  end

  defp maybe_store_return_to(%{method: "GET"} = conn) do
    put_session(conn, :user_return_to, current_path(conn))
  end

  defp maybe_store_return_to(conn), do: conn
end
