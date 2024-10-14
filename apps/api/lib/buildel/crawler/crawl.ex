defmodule Buildel.Crawler.Crawl do
  alias Buildel.Crawler.Page
  alias __MODULE__

  @derive {Jason.Encoder, only: [:id, :status, :start_url, :error, :pages]}
  defstruct [
    :id,
    :status,
    :start_url,
    :error,
    :url_filter,
    :client,
    pages: [],
    pending_pages: [],
    processed_urls: [],
    max_depth: 1
  ]

  def new(opts \\ []) do
    start_url = Keyword.get(opts, :start_url)
    max_depth = Keyword.get(opts, :max_depth)
    url_filter = Keyword.get(opts, :url_filter)
    client = Keyword.get(opts, :client)

    case URI.parse(start_url) do
      %URI{scheme: nil} ->
        %Crawl{
          id: UUID.uuid4(),
          status: :error,
          error: :invalid_url,
          start_url: start_url,
          max_depth: max_depth,
          url_filter: url_filter,
          client: client
        }

      _ ->
        %Crawl{
          id: UUID.uuid4(),
          status: :pending,
          start_url: start_url,
          max_depth: max_depth,
          url_filter: url_filter,
          client: client
        }
    end
  end

  def add_page(%Crawl{status: :error} = crawl, _page), do: crawl

  def add_page(%Crawl{max_depth: max_depth} = crawl, %{depth: depth})
      when depth > max_depth,
      do: crawl

  def add_page(crawl, page) do
    if Enum.member?(crawl.processed_urls, page.url) || !crawl.url_filter.(page.url) do
      crawl
    else
      %Crawl{
        crawl
        | processed_urls: [page.url | crawl.processed_urls],
          pending_pages: [page | crawl.pending_pages]
      }
    end
  end

  defp success_page(crawl, url, body) do
    {success_pages, pending_pages} =
      Enum.split_with(crawl.pending_pages, &(&1.url == url))

    pages = crawl.pages ++ (success_pages |> Enum.map(&Page.success(&1, body)))

    %Crawl{crawl | pages: pages, pending_pages: pending_pages}
  end

  defp error_page(crawl, url, reason) do
    {error_pages, pending_pages} =
      Enum.split_with(crawl.pending_pages, &(&1.url == url))

    pages = crawl.pages ++ (error_pages |> Enum.map(&Page.error(&1, reason)))

    %Crawl{crawl | pages: pages, pending_pages: pending_pages}
  end

  def start(%Crawl{status: :error} = crawl), do: crawl

  def start(crawl) do
    crawl |> request() |> finish()
  end

  defp finish(crawl) do
    if Enum.all?(crawl.pages, fn p -> p.status == :success end) do
      crawl |> success()
    else
      crawl |> error(:not_all_pages_successful)
    end
  end

  defp success(crawl) do
    %Crawl{crawl | status: :success}
  end

  defp error(crawl, reason) do
    %Crawl{crawl | status: :error, error: reason}
  end

  defp request(%Crawl{pending_pages: []} = crawl), do: crawl

  defp request(crawl) do
    %{url: url, depth: depth} = crawl.pending_pages |> List.first()

    request = %Req.Request{
      url: URI.parse(url)
    }

    case crawl.client.request(request) do
      {:ok, %Req.Response{status: status, body: body}}
      when status >= 200 and status < 400 ->
        crawl = success_page(crawl, url, body)

        find_linked_pages(body, depth + 1, url)
        |> Enum.reduce(crawl, &Crawl.add_page(&2, &1))
        |> request()

      _ ->
        error_page(crawl, url, :request_failed)
        |> request()
    end
  end

  defp find_linked_pages(html, depth, base_url) do
    {:ok, document} = Floki.parse_document(html)

    Floki.find(document, "a")
    |> Enum.flat_map(&Floki.attribute(&1, "href"))
    |> Enum.map(fn href ->
      case String.contains?(href, "://") do
        true -> href
        false -> URI.merge(base_url, href) |> Map.put(:fragment, nil) |> to_string()
      end
    end)
    |> Enum.map(fn url ->
      url |> String.trim_trailing("/")
    end)
    |> Enum.uniq()
    |> Enum.map(&Page.new(url: &1, depth: depth))
    |> Enum.filter(fn page -> page.status == :pending end)
  end
end
