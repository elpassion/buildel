defmodule BuildelWeb.Router do
  use BuildelWeb, :router

  import BuildelWeb.UserAuth
  import Plug.BasicAuth
  import Phoenix.LiveDashboard.Router

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
    plug :basic_auth, username: "michalmichal", password: "rzadzirzadzi"
  end

  pipeline :api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
  end

  scope "/dev" do
    pipe_through([:browser, :require_basic_auth])

    live_dashboard("/dashboard", metrics: BuildelWeb.Telemetry, ecto_repos: [Buildel.Repo])
    forward("/mailbox", Plug.Swoosh.MailboxPreview)
  end

  ## Api routes

  scope "/api", BuildelWeb do
    pipe_through(:api)

    post("/add", CalculatorController, :add)

    resources("/block_types", BlockTypesController, only: [:index])

    resources("/organizations/:organization_id/pipelines", OrganizationPipelineController,
      only: [:index, :delete, :create, :show, :update]
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

    resources(
      "/organizations/:organization_id/pipelines/:pipeline_id/runs",
      OrganizationPipelineRunController,
      only: [:index, :show, :create]
    )

    resources("/organizations/:organization_id/memory_collections", CollectionController,
      only: [:index, :create, :show],
      param: "name"
    )

    post("/organizations/:organization_id/memories", MemoryController, :create)
    get("/organizations/:organization_id/memories", MemoryController, :index)
    delete("/organizations/:organization_id/memories/:id", MemoryController, :delete)

    post("/users/register", UserRegistrationController, :create)
    get("/users/me", UserController, :me)
    post("/users/log_in", UserSessionController, :create)
    delete("/users/log_out", UserSessionController, :delete)

    resources("/organizations", OrganizationController, only: [:index, :create, :show])
    put("/organizations/:id", OrganizationController, :update)

    get("/organizations/:id/api_key", OrganizationController, :get_api_key)
    post("/organizations/:id/api_key", OrganizationController, :reset_api_key)

    get("/organizations/:id/keys", OrganizationController, :get_api_keys)
    post("/organizations/:id/keys", OrganizationController, :create_api_key)
    delete("/organizations/:id/keys/:key_id", OrganizationController, :delete_api_key)

    resources("/organizations/:organization_id/secrets", SecretController,
      only: [:index, :create, :show, :update, :delete],
      param: "name"
    )

    post("/channel_auth", ChannelAuthController, :create)
  end
end
