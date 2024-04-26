defmodule Buildel.Crawler do
  alias Buildel.Crawler.Page
  alias Buildel.Crawler.Crawl

  def crawl(url) do
    crawl = Crawl.new(start_url: url)

    case URI.parse(url) do
      %URI{scheme: "http" <> _rest} -> request(crawl)
      _ -> {:error, crawl |> Crawl.error(:invalid_url)}
    end
  end

  defp request(crawl) do
    url = crawl.start_url

    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
      when status_code >= 200 and status_code <= 400 ->
        {:ok, Crawl.success(crawl, Page.new(url: url, body: body))}

      _ ->
        {:error, crawl |> Crawl.error(:request_failed)}
    end
  end

  defmodule Crawl do
    defstruct [:id, :status, :start_url, :error, :pages]

    def new(opts \\ []) do
      start_url = Keyword.get(opts, :start_url)
      %Crawl{id: UUID.uuid4(), status: :pending, start_url: start_url}
    end

    def error(crawl, reason) do
      %Crawl{crawl | status: :error, error: reason}
    end

    def success(crawl, page) do
      %Crawl{crawl | status: :success, error: nil, pages: [page]}
    end
  end

  defmodule Page do
    defstruct [:url, :body]

    def new(opts \\ []) do
      url = Keyword.get(opts, :url)
      body = Keyword.get(opts, :body)
      %Page{url: url, body: body}
    end
  end
end
