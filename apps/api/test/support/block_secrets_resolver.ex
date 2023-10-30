defmodule Buildel.BlockSecrets.Mock do
  def get_secret_from_context(_context, secret_name) do
    secret_name
  end
end
