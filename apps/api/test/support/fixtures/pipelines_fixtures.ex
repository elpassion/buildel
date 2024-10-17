defmodule Buildel.PipelinesFixtures do
  import Buildel.OrganizationsFixtures
  require Ecto.Query

  def pipeline_fixture(attrs \\ %{}, config \\ %{version: "3"})

  def pipeline_fixture(attrs, %{version: "1"}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "1",
          "blocks" => [
            %{
              "name" => "input_block",
              "type" => "text_input",
              "opts" => %{},
              "inputs" => [],
              "ios" => []
            },
            %{
              "name" => "random_block",
              "type" => "audio_input",
              "opts" => %{},
              "inputs" => [],
              "ios" => []
            },
            %{
              "name" => "random_block_2",
              "type" => "speech_to_text",
              "opts" => %{
                "api_key" => "some_api_key"
              },
              "inputs" => ["random_block:output->input?reset=false"],
              "ios" => []
            },
            %{
              "name" => "random_block_3",
              "type" => "text_output",
              "opts" => %{},
              "inputs" => ["random_block_2:output->input"],
              "ios" => []
            },
            %{
              "name" => "random_block_4",
              "type" => "audio_output",
              "opts" => %{},
              "inputs" => ["random_block:output->input"],
              "ios" => []
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def pipeline_fixture(attrs, %{version: "2"}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "2",
          "blocks" => [
            %{
              "name" => "random_block",
              "type" => "audio_input",
              "opts" => %{},
              "connections" => [],
              "ios" => []
            },
            %{
              "name" => "random_block_2",
              "type" => "speech_to_text",
              "opts" => %{
                "api_key" => "some_api_key"
              },
              "connections" => [
                %{
                  "from" => %{
                    "block_name" => "random_block",
                    "output_name" => "output"
                  },
                  "to" => %{
                    "block_name" => "random_block_2",
                    "input_name" => "input"
                  },
                  "opts" => %{
                    "reset" => false
                  }
                }
              ],
              "ios" => []
            },
            %{
              "name" => "random_block_3",
              "type" => "text_output",
              "opts" => %{},
              "connections" => [
                %{
                  "from" => %{
                    "block_name" => "random_block_2",
                    "output_name" => "output"
                  },
                  "to" => %{
                    "block_name" => "random_block_3",
                    "input_name" => "input"
                  },
                  "opts" => %{
                    "reset" => true
                  }
                }
              ],
              "ios" => []
            },
            %{
              "name" => "random_block_4",
              "type" => "audio_output",
              "opts" => %{},
              "connections" => [
                %{
                  "from" => %{
                    "block_name" => "random_block",
                    "output_name" => "output"
                  },
                  "to" => %{
                    "block_name" => "random_block_4",
                    "input_name" => "input"
                  },
                  "opts" => %{
                    "reset" => true
                  }
                }
              ],
              "ios" => []
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def pipeline_fixture(attrs, %{version: "3"}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "3",
          "blocks" => [
            %{
              "name" => "random_block",
              "type" => "audio_input",
              "opts" => %{},
              "ios" => []
            },
            %{
              "name" => "random_block_2",
              "type" => "speech_to_text",
              "opts" => %{
                "api_key" => "some_api_key"
              },
              "ios" => []
            },
            %{
              "name" => "random_block_3",
              "type" => "text_output",
              "opts" => %{},
              "ios" => []
            },
            %{
              "name" => "random_block_4",
              "type" => "audio_output",
              "opts" => %{},
              "ios" => []
            }
          ],
          "connections" => [
            %{
              "from" => %{
                "block_name" => "random_block",
                "output_name" => "output"
              },
              "to" => %{
                "block_name" => "random_block_2",
                "input_name" => "input"
              },
              "opts" => %{
                "reset" => false,
                "optional" => false
              }
            },
            %{
              "from" => %{
                "block_name" => "random_block_2",
                "output_name" => "output"
              },
              "to" => %{
                "block_name" => "random_block_3",
                "input_name" => "input"
              },
              "opts" => %{
                "reset" => true,
                "optional" => false
              }
            },
            %{
              "from" => %{
                "block_name" => "random_block",
                "output_name" => "output"
              },
              "to" => %{
                "block_name" => "random_block_4",
                "input_name" => "input"
              },
              "opts" => %{
                "reset" => true,
                "optional" => false
              }
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def pipeline_fixture(attrs, %{version: "4"}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "4",
          "blocks" => [
            %{
              "name" => "text_input_10",
              "type" => "text_input",
              "opts" => %{},
              "ios" => []
            },
            %{
              "name" => "text_output_10",
              "type" => "text_output",
              "opts" => %{},
              "ios" => []
            }
          ],
          "connections" => [
            %{
              "from" => %{
                "block_name" => "text_input_10",
                "output_name" => "output"
              },
              "to" => %{
                "block_name" => "text_output_10",
                "input_name" => "input"
              },
              "opts" => %{
                "reset" => true,
                "optional" => false
              }
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def pipeline_fixture(attrs, %{version: "5", sub_pipeline_id: sub_pipeline_id}) do
    {:ok, pipeline} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        config: %{
          "version" => "5",
          "blocks" => [
            %{
              "name" => "text_input_1",
              "type" => "text_input",
              "opts" => %{},
              "ios" => []
            },
            %{
              "name" => "workflow_call_1",
              "type" => "workflow_call",
              "opts" => %{
                "workflow" => "#{sub_pipeline_id}"
              },
              "ios" => []
            },
            %{
              "name" => "text_output_1",
              "type" => "text_output",
              "opts" => %{},
              "ios" => []
            }
          ],
          "connections" => [
            %{
              "from" => %{
                "block_name" => "workflow_call_1",
                "output_name" => "text_output_10:output"
              },
              "to" => %{
                "block_name" => "text_output_1",
                "input_name" => "input"
              },
              "opts" => %{
                "reset" => true,
                "optional" => false
              }
            },
            %{
              "from" => %{
                "block_name" => "text_input_1",
                "output_name" => "output"
              },
              "to" => %{
                "block_name" => "workflow_call_1",
                "input_name" => "text_input_10:input"
              },
              "opts" => %{
                "reset" => true,
                "optional" => false
              }
            }
          ]
        }
      })
      |> Buildel.Pipelines.create_pipeline()

    pipeline
  end

  def run_fixture(attrs \\ %{}, pipeline_config \\ %{version: "1"}, date \\ nil) do
    pipeline =
      case attrs[:pipeline_id] do
        nil -> pipeline_fixture(%{}, pipeline_config)
        id -> Buildel.Pipelines.get_pipeline!(id)
      end

    {:ok, run} =
      attrs
      |> Enum.into(%{
        pipeline_id: pipeline.id,
        config: pipeline.config
      })
      |> Buildel.Pipelines.create_run()

    if date do
      Ecto.Query.from(r in Buildel.Pipelines.Run,
        where: r.id == ^run.id,
        update: [set: [inserted_at: ^date]]
      )
      |> Buildel.Repo.update_all([])
    end

    run
  end

  def log_fixture(attrs \\ %{}) do
    run =
      case attrs[:run_id] do
        nil ->
          run_fixture(%{
            pipeline_id: attrs[:pipeline_id]
          })

        id ->
          Buildel.Pipelines.get_run(id)
      end

    {:ok, log} =
      attrs
      |> Enum.into(%{
        run_id: run.id
      })
      |> Buildel.RunLogs.create_run_log()

    if attrs[:inserted_at] do
      Ecto.Query.from(l in Buildel.Pipelines.AggregatedLog,
        where: l.id == ^log.id,
        update: [set: [inserted_at: ^attrs[:inserted_at]]]
      )
      |> Buildel.Repo.update_all([])
    end

    log
  end

  def alias_fixture(attrs \\ %{}) do
    pipeline =
      if attrs[:pipeline_id] do
        attrs[:pipeline_id] |> Buildel.Pipelines.get_pipeline!()
      else
        pipeline_fixture()
      end

    alias_config =
      attrs
      |> Enum.into(%{
        name: "some name",
        config: pipeline.config || %{},
        interface_config: pipeline.interface_config || %{},
        pipeline_id: pipeline.id
      })

    {:ok, alias} = Buildel.Pipelines.create_alias(alias_config)

    alias
  end
end
