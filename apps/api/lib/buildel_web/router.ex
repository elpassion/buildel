defmodule BuildelWeb.Router do
  use BuildelWeb, :router

  import BuildelWeb.UserAuth
  import Plug.BasicAuth

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

  scope "/", BuildelWeb do
    pipe_through(:browser)

    get("/", PageController, :home)
  end

  import Phoenix.LiveDashboard.Router

  scope "/dev" do
    pipe_through([:browser, :require_basic_auth])

    live_dashboard("/dashboard", metrics: BuildelWeb.Telemetry, ecto_repos: [Buildel.Repo])
    forward("/mailbox", Plug.Swoosh.MailboxPreview)
  end

  ## Api routes

  scope "/api", BuildelWeb do
    pipe_through(:api)

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

  ## Authentication routes

  scope "/", BuildelWeb do
    pipe_through([:browser, :redirect_if_user_is_authenticated])

    live_session :redirect_if_user_is_authenticated,
      on_mount: [{BuildelWeb.UserAuth, :redirect_if_user_is_authenticated}] do
      live("/users/register", UserRegistrationLive, :new)
      live("/users/log_in", UserLoginLive, :new)
      live("/users/reset_password", UserForgotPasswordLive, :new)
      live("/users/reset_password/:token", UserResetPasswordLive, :edit)
    end

    post("/users/log_in", UserSessionController, :create)
  end

  scope "/", BuildelWeb do
    pipe_through([:browser, :require_authenticated_user])

    live_session :require_authenticated_user,
      on_mount: [{BuildelWeb.UserAuth, :ensure_authenticated}] do
      live("/users/settings", UserSettingsLive, :edit)
      live("/users/settings/confirm_email/:token", UserSettingsLive, :confirm_email)

      live("/organizations", OrganizationLive.Index, :index)
      live("/organizations/new", OrganizationLive.Index, :new)
      live("/organizations/:id/edit", OrganizationLive.Index, :edit)

      live("/organizations/:id", OrganizationLive.Show, :show)
      live("/organizations/:id/show/edit", OrganizationLive.Show, :edit)

      live("/organizations/:organization_id/memberships", MembershipLive.Index, :index)
      live("/organizations/:organization_id/memberships/new", MembershipLive.Index, :new)
    end
  end

  scope "/", BuildelWeb do
    pipe_through([:browser])

    delete("/users/log_out", UserSessionController, :delete)

    live_session :current_user,
      on_mount: [{BuildelWeb.UserAuth, :mount_current_user}] do
      live("/users/confirm/:token", UserConfirmationLive, :edit)
      live("/users/confirm", UserConfirmationInstructionsLive, :new)
    end
  end

  # ## Authentication routes

  # scope "/", BuildelWeb do
  #   pipe_through([:browser, :redirect_if_user2_is_authenticated])

  #   post("/users2/register", User2RegistrationController, :create)
  #   post("/users2/log_in", User2SessionController, :create)
  #   post("/users2/reset_password", User2ResetPasswordController, :create)
  #   put("/users2/reset_password/:token", User2ResetPasswordController, :update)
  # end

  # scope "/", BuildelWeb do
  #   pipe_through([:browser, :require_authenticated_user2])

  #   get("/users2/settings", User2SettingsController, :edit)
  #   put("/users2/settings", User2SettingsController, :update)
  #   get("/users2/settings/confirm_email/:token", User2SettingsController, :confirm_email)
  # end

  # scope "/", BuildelWeb do
  #   pipe_through([:browser])

  #   delete("/users2/log_out", User2SessionController, :delete)
  #   get("/users2/confirm", User2ConfirmationController, :new)
  #   post("/users2/confirm", User2ConfirmationController, :create)
  #   get("/users2/confirm/:token", User2ConfirmationController, :edit)
  #   post("/users2/confirm/:token", User2ConfirmationController, :update)
  # end
end
