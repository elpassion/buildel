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

  defmodule SitemapResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CrawlSitemapResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      },
      required: [:data]
    })
  end

  defmodule CrawlsResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CrawlCrawlsResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      },
      required: [:data]
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
        url: %Schema{type: :string, description: "Starting URL"},
        max_depth: %Schema{
          type: :integer,
          description: "Maximum depth to crawl",
          default: 1,
          maximum: 3
        },
        memory_collection_id: %Schema{
          type: :integer,
          description: "Memory collection ID to store the crawl results"
        }
      },
      required: [:url, :memory_collection_id]
    })
  end

  defmodule BulkCrawlRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CrawlBulkRequest",
      type: :object,
      properties: %{
        urls: %Schema{
          type: :array,
          items: %Schema{type: :string},
          description: "URLs to crawl"
        },
        memory_collection_id: %Schema{
          type: :integer,
          description: "Memory collection ID to store the crawl results"
        }
      },
      required: [:url, :memory_collection_id]
    })
  end
end
