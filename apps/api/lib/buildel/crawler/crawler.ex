defmodule Buildel.Crawler do
  alias Buildel.Crawler.Crawl
  alias Buildel.Crawler.Page

  def crawl(url, opts \\ []) when is_binary(url) do
    max_depth = Keyword.get(opts, :max_depth, 1)

    crawl =
      Crawl.new(start_url: url, max_depth: max_depth)
      |> Crawl.add_page(Page.new(url: url))
      |> Crawl.start()

    case crawl.status do
      :error -> {:error, crawl}
      _ -> {:ok, crawl}
    end
  end

  defmodule Crawl do
    alias Buildel.Crawler.Page

    defstruct [
      :id,
      :status,
      :start_url,
      :error,
      pages: [],
      pending_pages: [],
      max_depth: 1
    ]

    def new(opts \\ []) do
      start_url = Keyword.get(opts, :start_url)
      max_depth = Keyword.get(opts, :max_depth)

      case URI.parse(start_url) do
        %URI{scheme: nil} ->
          %Crawl{
            id: UUID.uuid4(),
            status: :error,
            error: :invalid_url,
            start_url: start_url,
            max_depth: max_depth
          }

        _ ->
          %Crawl{id: UUID.uuid4(), status: :pending, start_url: start_url, max_depth: max_depth}
      end
    end

    def add_page(%Crawl{status: :error} = crawl, _page), do: crawl

    def add_page(%Crawl{max_depth: max_depth} = crawl, %{depth: depth})
        when depth > max_depth,
        do: crawl

    def add_page(crawl, page) do
      %Crawl{crawl | pending_pages: [page | crawl.pending_pages]}
    end

    def success_page(crawl, url, body) do
      {success_pages, pending_pages} =
        Enum.split_with(crawl.pending_pages, &(&1.url == url))

      pages = crawl.pages ++ (success_pages |> Enum.map(&Page.success(&1, body)))

      %Crawl{crawl | pages: pages, pending_pages: pending_pages}
    end

    def error_page(crawl, url, reason) do
      {error_pages, pending_pages} =
        Enum.split_with(crawl.pending_pages, &(&1.url == url))

      pages = crawl.pages ++ (error_pages |> Enum.map(&Page.error(&1, reason)))

      %Crawl{crawl | pages: pages, pending_pages: pending_pages}
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

    defp request(%Crawl{pending_pages: []} = crawl), do: crawl

    defp request(crawl) do
      %{url: url, depth: depth} = crawl.pending_pages |> List.first()

      case HTTPoison.get(url) do
        {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
        when status_code >= 200 and status_code <= 400 ->
          crawl = Crawl.success_page(crawl, url, body)

          find_linked_pages(body, depth + 1)
          |> Enum.reduce(crawl, &Crawl.add_page(&2, &1))
          |> request()

        _ ->
          error_page(crawl, url, :request_failed)
          |> request()
      end
    end

    defp find_linked_pages(html, depth) do
      {:ok, document} = Floki.parse_document(html)

      Floki.find(document, "a")
      |> Enum.flat_map(&Floki.attribute(&1, "href"))
      |> Enum.map(&Page.new(url: &1, depth: depth))
      |> Enum.filter(fn page -> page.status == :pending end)
    end
  end

  defmodule Page do
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
end
