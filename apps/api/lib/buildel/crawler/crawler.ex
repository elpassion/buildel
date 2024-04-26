defmodule Buildel.Crawler do
  def crawl(url) do
    case URI.parse(url) do
      %URI{scheme: "http" <> _rest} -> {:error, :request_failed}
      _ -> {:error, :invalid_url}
    end
  end
end
