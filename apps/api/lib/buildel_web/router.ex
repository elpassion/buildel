defmodule BuildelWeb.Router do
  use BuildelWeb, :router

  import BuildelWeb.UserAuth
  import BuildelWeb.BasicAuth
  import Phoenix.LiveDashboard.Router
  alias OpenApiSpex.Plug.{RenderSpec, PutApiSpec}

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_live_flash)
    plug(:put_root_layout, html: {BuildelWeb.Layouts, :root})
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    plug(:fetch_current_user)
  end

  pipeline :require_basic_auth do
    plug :basic_auth
  end

  pipeline :api do
    plug(:accepts, ["json", "sse"])
    plug(:fetch_session)
    plug(PutApiSpec, module: BuildelWeb.ApiSpec)
  end

  pipeline :with_etag do
    plug ETag.Plug
  end

  scope "/" do
    pipe_through([:browser, :with_etag])

    get "/swaggerui", OpenApiSpex.Plug.SwaggerUI, path: "/api/openapi"
  end

  scope "/dev" do
    pipe_through([:browser, :require_basic_auth, :with_etag])

    live_dashboard("/dashboard",
      metrics: BuildelWeb.Telemetry,
      metrics_history: {BuildelWeb.MetricsStorage, :metrics_history, []},
      ecto_repos: [Buildel.Repo]
    )

    forward("/mailbox", Plug.Swoosh.MailboxPreview)
  end

  ## Api routes

  get "/", BuildelWeb.VersionController, :index

  scope "/api", BuildelWeb do
    pipe_through(:api)

    get(
      "/organizations/:organization_id/datasets/:dataset_id/rows/export",
      DatasetRowsController,
      :export
    )

    get(
      "/organizations/:organization_id/experiments/:experiment_id/runs/:run_id/runs/export",
      ExperimentRunRunController,
      :export
    )

    ## Add etag plug
    pipe_through(:with_etag)

    post("/add", CalculatorController, :add)

    resources("/block_types", BlockTypesController, only: [:index])
    get("/block_types/overviews", BlockTypesController, :overviews)

    resources("/organizations/:organization_id/workflow_templates", WorkflowTemplateController,
      only: [:index, :create]
    )

    resources("/organizations/:organization_id/pipelines", OrganizationPipelineController,
      only: [:index, :create, :delete, :show, :update],
      param: "pipeline_id"
    )

    get(
      "/organizations/:organization_id/pipelines/:pipeline_id/details",
      OrganizationPipelineController,
      :details
    )

    get(
      "/organizations/:organization_id/pipelines/:pipeline_id/ios",
      OrganizationPipelineController,
      :ios
    )

    get(
      "/organizations/:organization_id/pipelines/:pipeline_id/public",
      OrganizationPipelinePublicController,
      :show
    )

    resources("/organizations/:organization_id/models", OrganizationModelController,
      only: [:index]
    )

    resources(
      "/organizations/:organization_id/models/embeddings",
      OrganizationModelEmbeddingController,
      only: [:index]
    )

    resources("/organizations/:organization_id/memberships", OrganizationMembershipController,
      only: [:index, :create]
    )

    resources(
      "/organizations/:organization_id/invitations",
      OrganizationMembershipInvitationController,
      only: [:index, :create, :delete]
    )

    post(
      "/organizations/invitations/accept",
      OrganizationMembershipInvitationController,
      :accept
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/start",
      OrganizationPipelineRunController,
      :start
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/stop",
      OrganizationPipelineRunController,
      :stop
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/input",
      OrganizationPipelineRunController,
      :input
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/input_file",
      OrganizationPipelineRunController,
      :input_file
    )

    delete(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/input_file",
      OrganizationPipelineRunController,
      :input_file_delete
    )

    resources(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs",
      OrganizationPipelineRunController,
      only: [:index, :show, :create]
    )

    resources(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs/:id/logs",
      OrganizationPipelineRunLogsController,
      only: [:index]
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/chat/completions",
      OrganizationPipelineChatCompletionController,
      :create
    )

    post(
      "/organizations/:organization_id/pipelines/:pipeline_id/v1/chat/completions",
      OrganizationPipelineChatCompletionController,
      :create
    )

    resources(
      "/organizations/:organization_id/pipelines/:pipeline_id/aliases",
      OrganizationPipelineAliasController,
      only: [:index, :create, :show, :update, :delete]
    )

    resources(
      "/organizations/:organization_id/pipelines/:pipeline_id/blocks",
      OrganizationPipelineBlockController,
      only: [:create]
    )

    resources("/organizations/:organization_id/memory_collections", CollectionController,
      only: [:index, :create, :show, :delete, :update]
    )

    get(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs",
      CollectionGraphController,
      :show
    )

    get(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs/related",
      CollectionGraphController,
      :related
    )

    get(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs/details",
      CollectionGraphController,
      :details
    )

    get(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs/state",
      CollectionGraphController,
      :state
    )

    post(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs",
      CollectionGraphController,
      :create
    )

    delete(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/graphs",
      CollectionGraphController,
      :stop
    )

    get(
      "/organizations/:organization_id/memory_collections/:id/search",
      CollectionController,
      :search
    )

    resources(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/costs",
      CollectionCostsController,
      only: [:index]
    )

    resources(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/memories",
      MemoryController,
      only: [:index, :create, :delete]
    )

    delete(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/memories",
      MemoryController,
      :bulk_delete
    )

    resources(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/files",
      MemoryFilesController,
      only: [:show, :create]
    )

    resources(
      "/organizations/:organization_id/memory_collections/:memory_collection_id/memories/:id/chunks",
      MemoryChunkController,
      only: [:index]
    )

    resources(
      "/organizations/:organization_id/datasets/files",
      DatasetFilesController,
      only: [:show, :create]
    )

    resources(
      "/organizations/:organization_id/datasets",
      DatasetController,
      only: [:index, :show, :create, :delete, :update]
    )

    post("/organizations/:organization_id/datasets/:id/files", DatasetController, :create_file)

    resources(
      "/organizations/:organization_id/experiments",
      ExperimentController,
      only: [:index, :show, :create, :delete]
    )

    resources(
      "/organizations/:organization_id/experiments/:experiment_id/runs",
      ExperimentRunController,
      only: [:index, :create, :show]
    )

    resources(
      "/organizations/:organization_id/experiments/:experiment_id/runs/:run_id/runs",
      ExperimentRunRunController,
      only: [:index]
    )

    resources(
      "/organizations/:organization_id/datasets/:dataset_id/rows",
      DatasetRowsController,
      only: [:index, :create, :show, :delete, :update]
    )

    post("/organizations/:organization_id/tools/chunks", OrganizationToolChunkController, :create)
    post("/organizations/:organization_id/tools/crawls", OrganizationToolCrawlController, :create)

    post(
      "/organizations/:organization_id/tools/crawls/bulk",
      OrganizationToolCrawlController,
      :bulk_crawl
    )

    get(
      "/organizations/:organization_id/tools/crawls",
      OrganizationToolCrawlController,
      :show_crawls
    )

    get(
      "/organizations/:organization_id/tools/crawls/sitemap",
      OrganizationToolCrawlController,
      :sitemap
    )

    post(
      "/organizations/:organization_id/tools/embeddings",
      OrganizationToolEmbeddingsController,
      :create
    )

    get("/users/me", UserController, :me)
    put("/users", UserController, :update)
    post("/users/log_in", UserSessionController, :create)
    post("/users/google/log_in", UserSessionController, :create_google)
    post("/users/github/log_in", UserSessionController, :create_github)
    delete("/users/log_out", UserSessionController, :delete)
    put("/users/password", UserPasswordController, :update)
    post("/users/password/reset", UserPasswordResetController, :create)
    put("/users/password/reset", UserPasswordResetController, :update)

    resources("/organizations", OrganizationController, only: [:index, :create, :show])
    put("/organizations/:id", OrganizationController, :update)

    resources("/organizations/:organization_id/costs", OrganizationCostsController,
      only: [:index]
    )

    get("/organizations/:id/api_key", OrganizationController, :get_api_key)
    post("/organizations/:id/api_key", OrganizationController, :reset_api_key)

    get("/organizations/:organization_id/secrets/aliases", SecretController, :aliases)

    resources("/organizations/:organization_id/secrets", SecretController,
      only: [:index, :create, :show, :update, :delete],
      param: "name"
    )

    post("/channel_auth", ChannelAuthController, :create)

    post("/users/register/invitation", UserRegistrationController, :invitation_create)
    get("/users/register", UserRegistrationController, :check)
    post("/users/register", UserRegistrationController, :create)
  end

  scope "/api" do
    pipe_through(:api)

    get "/openapi", RenderSpec, []
  end
end
