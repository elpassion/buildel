defmodule Buildel.Repo.Migrations.UpdatePipelineInterfaceConfig do
  alias Buildel.Pipelines.Alias
  alias Buildel.Pipelines.Pipeline
  use Ecto.Migration

  def up do
    Buildel.Repo.transaction(fn ->
      Buildel.Repo.all(Buildel.Pipelines.Pipeline)
      |> Enum.map(fn pipeline ->
        Pipeline.changeset(pipeline, %{
          interface_config: update_interface_config_up(pipeline.interface_config)
        })
        |> Buildel.Repo.update!()
      end)

      Buildel.Repo.all(Buildel.Pipelines.Alias)
      |> Enum.map(fn alias ->
        Alias.changeset(alias, %{
          interface_config: update_interface_config_up(alias.interface_config)
        })
        |> Buildel.Repo.update!()
      end)
    end)
  end

  defp update_interface_config_up(interface_config) do
    case interface_config do
      nil ->
        nil

      config when config == %{} ->
        %{}

      config ->
        text =
          if is_nil(Map.get(config, "input")),
            do: [],
            else: [Map.get(config, "input")]

        file =
          if is_nil(Map.get(config, "file")),
            do: [],
            else: [Map.get(config, "file")]

        outputs =
          if is_nil(Map.get(config, "output")),
            do: [],
            else: [Map.get(config, "output")]

        %{
          webchat: %{
            inputs: text ++ file,
            outputs: outputs,
            public: Map.get(config, "public", false)
          }
        }
    end
  end
end
