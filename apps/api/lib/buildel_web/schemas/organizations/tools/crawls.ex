defmodule BuildelWeb.Schemas.Crawls do
  alias OpenApiSpex.Schema

  defmodule Crawl do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Crawl",
      type: :object,
      properties: %{
        url: %Schema{type: :string, description: "Crawl starting url"}
      },
      required: [:url]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CrawlShowResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Crawls.Crawl
        }
      },
      required: [:data]
    })
  end

  defmodule CreateCrawlRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CrawlCreateRequest",
      type: :object,
      properties: %{
        url: %Schema{type: :string, description: "Starting URL"}
      },
      required: [:url]
    })
  end
end
