defmodule Buildel.Crawler do
  alias Buildel.Crawler.Page
  alias Buildel.Crawler.Crawl

  def crawl(url) when is_binary(url) do
    crawl =
      Crawl.new(start_url: url)
      |> Crawl.add_page(Page.new(url: url))
      |> Crawl.start()

    case crawl.status do
      :error -> {:error, crawl}
      _ -> {:ok, crawl}
    end
  end

  defmodule Crawl do
    defstruct [:id, :status, :start_url, :error, pages: []]

    def new(opts \\ []) do
      start_url = Keyword.get(opts, :start_url)

      case URI.parse(start_url) do
        %URI{scheme: nil} ->
          %Crawl{id: UUID.uuid4(), status: :error, error: :invalid_url, start_url: start_url}

        _ ->
          %Crawl{id: UUID.uuid4(), status: :pending, start_url: start_url}
      end
    end

    def add_page(%Crawl{status: :error} = crawl, _page), do: crawl

    def add_page(crawl, page) do
      %Crawl{crawl | pages: [page | crawl.pages]}
    end

    def success_page(crawl, url, body) do
      pages =
        Enum.map(crawl.pages, fn p ->
          if p.url == url do
            Page.success(p, body)
          else
            p
          end
        end)

      %Crawl{crawl | pages: pages}
    end

    def error_page(crawl, url, reason) do
      pages =
        Enum.map(crawl.pages, fn p ->
          if p.url == url do
            Page.error(p, reason)
          else
            p
          end
        end)

      %Crawl{crawl | pages: pages}
    end

    def start(%Crawl{status: :error} = crawl), do: crawl

    def start(crawl) do
      crawl |> request() |> finish()
    end

    def finish(crawl) do
      if Enum.all?(crawl.pages, fn p -> p.status == :success end) do
        crawl |> success()
      else
        crawl |> error(:not_all_pages_successful)
      end
    end

    def success(crawl) do
      %Crawl{crawl | status: :success}
    end

    def error(crawl, reason) do
      %Crawl{crawl | status: :error, error: reason}
    end

    defp request(crawl) do
      url = crawl.pages |> List.first() |> Map.get(:url)

      case HTTPoison.get(url) do
        {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
        when status_code >= 200 and status_code <= 400 ->
          Crawl.success_page(crawl, url, body)

        _ ->
          Crawl.error_page(crawl, url, :request_failed)
      end
    end
  end

  defmodule Page do
    defstruct [:url, :body, :status, :error]

    def new(opts \\ []) do
      url = Keyword.get(opts, :url)

      case URI.parse(url) do
        %URI{host: "http" <> _rest} -> %Page{url: url, status: :pending}
        _ -> %Page{url: url, status: :error}
      end
    end

    def success(page, body) do
      %Page{page | status: :success, body: body}
    end

    def error(page, reason) do
      %Page{page | status: :error, error: reason}
    end
  end
end
