defmodule BuildelWeb.GoogleToken do
  use Joken.Config

  add_hook(JokenJwks, strategy: BuildelWeb.GoogleJwksStrategy)

  def token_config do
    IO.puts("config")
    %{}
  end
end
