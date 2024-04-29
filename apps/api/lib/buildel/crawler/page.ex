defmodule Buildel.Crawler.Page do
  alias __MODULE__
  defstruct [:url, :body, :status, :error, :depth]

  def new(opts \\ []) do
    url = Keyword.get(opts, :url)
    depth = Keyword.get(opts, :depth, 1)

    case URI.parse(url) do
      %URI{scheme: "http" <> _rest} -> %Page{url: url, status: :pending, depth: depth}
      _ -> %Page{url: url, status: :error, depth: depth}
    end
  end

  def success(page, body) do
    %Page{page | status: :success, body: body}
  end

  def error(page, reason) do
    %Page{page | status: :error, error: reason}
  end
end
