defmodule BuildelWeb.GoogleJwksStrategy do
  use JokenJwks.DefaultStrategyTemplate

  def init_opts(_opts), do: [jwks_url: "https://www.googleapis.com/oauth2/v3/certs"]
end
