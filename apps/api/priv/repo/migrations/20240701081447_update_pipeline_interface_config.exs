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

  def down do
    Buildel.Repo.transaction(fn ->
      Buildel.Repo.all(Buildel.Pipelines.Pipeline)
      |> Enum.map(fn pipeline ->
        Pipeline.changeset(pipeline, %{
          interface_config: update_interface_config_down(pipeline.interface_config)
        })
        |> Buildel.Repo.update!()
      end)

      Buildel.Repo.all(Buildel.Pipelines.Alias)
      |> Enum.map(fn alias ->
        Alias.changeset(alias, %{
          interface_config: update_interface_config_down(alias.interface_config)
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
            else: [
              %{
                name: Map.get(config, "input"),
                type: "text_input"
              }
            ]

        file =
          if is_nil(Map.get(config, "file")),
            do: [],
            else: [
              %{
                name: Map.get(config, "file"),
                type: "file_input"
              }
            ]

        outputs =
          if is_nil(Map.get(config, "output")),
            do: [],
            else: [
              %{
                name: Map.get(config, "output"),
                type: "text_output"
              }
            ]

        %{
          webchat: %{
            inputs: text ++ file,
            outputs: outputs,
            public: Map.get(config, "public", false)
          }
        }
    end
  end

  defp update_interface_config_down(interface_config) do
    case interface_config do
      nil ->
        nil

      config when config == %{} ->
        %{}

      config ->
        inputs = Map.get(config["webchat"], "inputs", [])
        outputs = Map.get(config["webchat"], "outputs", [])

        text_input = Enum.find(inputs, %{}, fn input -> input["type"] == "text_input" end)
        file_input = Enum.find(inputs, %{}, fn input -> input["type"] == "file_input" end)

        %{
          "input" => Map.get(text_input, "name"),
          "file" => Map.get(file_input, "name"),
          "output" => Map.get(List.first(outputs, %{}), "name"),
          "public" => Map.get(config["webchat"], "public", false)
        }
    end
  end
end
