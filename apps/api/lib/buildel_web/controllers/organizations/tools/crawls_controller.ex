defmodule BuildelWeb.OrganizationToolCrawlController do
  alias Buildel.Crawler
  use BuildelWeb, :controller

  use OpenApiSpex.ControllerSpecs
  import BuildelWeb.UserAuth
  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["organization"]

  operation :sitemap,
    summary: "Get sitemap",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      url: [in: :query, description: "URL", type: :string, required: true]
    ],
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Crawls.SitemapResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def sitemap(conn, _params) do
    %{organization_id: organization_id, url: url} = conn.params

    user = conn.assigns.current_user

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, list} <- Buildel.Sitemaps.get_sitemaps(url) do
      conn
      |> put_status(:ok)
      |> render(:sitemap, sitemap: list)
    else
      _ ->
        conn
        |> put_status(:ok)
        |> render(:sitemap, sitemap: [])
    end
  end

  operation :bulk_crawl,
    summary: "Create bulk crawl",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: {"crawl", "application/json", BuildelWeb.Schemas.Crawls.BulkCrawlRequest},
    responses: [
      ok: {"ok", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def bulk_crawl(conn, _params) do
    %{organization_id: organization_id} = conn.params

    %{urls: urls, memory_collection_id: memory_collection_id} =
      conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         :ok <- Buildel.Memories.Crawls.Runner.run(organization, collection, urls) do
      conn
      |> put_status(:ok)
      |> json(%{})
    end
  end

  operation :show_crawls,
    summary: "Show remaining crawls",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      memory_collection_id: [
        in: :query,
        description: "Memory collection ID",
        type: :integer,
        required: true
      ]
    ],
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Crawls.CrawlsResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show_crawls(conn, _params) do
    %{organization_id: organization_id, memory_collection_id: memory_collection_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         tasks <- Buildel.Memories.Crawls.Runner.get_remaining_tasks(collection.id) do
      conn
      |> put_status(:ok)
      |> render(:show_crawls, tasks: tasks)
    end
  end

  operation :create,
    summary: "Create crawl",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: {"crawl", "application/json", BuildelWeb.Schemas.Crawls.CreateCrawlRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Crawls.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params

    %{url: url, max_depth: max_depth, memory_collection_id: memory_collection_id} =
      conn.body_params

    uri = URI.parse(url)

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id) do
      case Crawler.crawl(url,
             max_depth: max_depth,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ) do
        {:ok, crawl} ->
          crawl.pages
          |> Enum.map(&process_page(&1, organization, collection))
          |> Task.await_many(60_000)

          conn
          |> put_status(:created)
          |> render(:show, crawls: [])

        {:error, %Crawler.Crawl{error: :not_all_pages_successful, pages: pages}} ->
          pages
          |> Enum.map(&process_page(&1, organization, collection))
          |> Task.await_many(60_000)

          conn
          |> put_status(:created)
          |> render(:show, crawls: [])
      end
    end
  end

  defp process_page(page, organization, collection) do
    Task.async(fn ->
      # html instead of markdown because https://github.com/nlmatics/nlm-ingestor/issues/83
      path = Temp.path!(%{suffix: ".html"})
      # page.body |> Html2Markdown.convert()
      File.write!(path, page.body)

      Buildel.Memories.create_organization_memory(organization, collection, %{
        path: path,
        type: "text/html",
        name: page.url
      })

      nil
    end)
  end
end
