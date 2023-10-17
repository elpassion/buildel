defmodule Buildel.Encrypted.Binary do
  use Cloak.Ecto.Binary, vault: Buildel.Vault
end