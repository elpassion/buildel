defmodule BuildelWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :buildel

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @secure_cookie Application.compile_env(:buildel, :secure_cookie)
  @session_options [
    store: :cookie,
    key: "_buildel_key",
    signing_salt: "PQ/dWRMh",
    same_site: "Lax",
    http_only: true,
    secure: @secure_cookie
  ]
  socket "/socket", BuildelWeb.PipelineSocket, websocket: true, longpoll: false

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug CORSPlug
  # plug ETag.Plug
  plug BuildelWeb.Router
end
