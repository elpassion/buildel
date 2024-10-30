defmodule Buildel.Crawler do
  alias Buildel.Crawler.Crawl
  alias Buildel.Crawler.Page
  alias Buildel.Clients.HttpApi

  def crawl(url, opts \\ []) when is_binary(url) do
    opts =
      Keyword.validate!(opts,
        max_depth: 1,
        url_filter: fn _ -> true end,
        client: HttpApi,
        headers: []
      )

    max_depth = Keyword.get(opts, :max_depth)
    url_filter = Keyword.get(opts, :url_filter)
    client = Keyword.get(opts, :client)
    headers = Keyword.get(opts, :headers)

    crawl =
      Crawl.new(
        start_url: url,
        max_depth: max_depth,
        url_filter: url_filter,
        client: client,
        headers: headers
      )
      |> Crawl.add_page(Page.new(url: url))
      |> Crawl.start()

    pages =
      crawl.pages
      |> Enum.filter(fn page -> page.status == :success end)
      |> Enum.filter(fn page -> !(page.body == "" || is_nil(page.body)) end)

    crawl = crawl |> Map.put(:pages, pages)

    case crawl.status do
      :error -> {:error, crawl}
      _ -> {:ok, crawl}
    end
  end
end
