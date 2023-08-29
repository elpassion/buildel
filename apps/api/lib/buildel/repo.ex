defmodule Buildel.Repo do
  use Ecto.Repo,
    otp_app: :buildel,
    adapter: Ecto.Adapters.Postgres
end
