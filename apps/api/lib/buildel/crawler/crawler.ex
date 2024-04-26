defmodule Buildel.Crawler do
  def crawl(url) do
    case URI.parse(url) do
      %URI{scheme: "http" <> _rest} -> request(url)
      _ -> {:error, :invalid_url}
    end
  end

  defp request(url) do
    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
      when status_code >= 200 and status_code <= 400 ->
        {:ok, %{body: body, url: url}}

      _ ->
        {:error, :request_failed}
    end
  end
end
