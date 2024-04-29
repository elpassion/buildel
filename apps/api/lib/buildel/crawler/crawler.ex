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
end
