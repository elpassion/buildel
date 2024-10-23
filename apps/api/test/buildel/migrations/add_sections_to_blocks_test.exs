defmodule Buildel.Migrations.AddSectionsToChatBlocksTest do
  alias Buildel.Pipelines
  use Buildel.DataCase, async: true
  import Buildel.PipelinesFixtures

  describe "migrate/2" do
    test "correctly adds model_section to chat" do
      pipeline =
        pipeline_fixture(
          %{
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
                  "name" => "chat",
                  "type" => "chat",
                  "opts" => %{
                    "model" => "a",
                    "temperature" => 0,
                    "api_key" => "c",
                    "api_type" => "openai",
                    "endpoint" => "test"
                  },
                  "ios" => []
                }
              ],
              "connections" => []
            }
          },
          %{
            version: "4"
          }
        )

      _alias_1 = alias_fixture(%{pipeline_id: pipeline.id})

      pipelines = Pipelines.list_pipelines()
      aliases = Pipelines.list_aliases()

      %{pipelines: pipelines, aliases: aliases} =
        Buildel.Migrations.AddSectionsToChatBlocks.migrate(pipelines, aliases)

      assert [
               %{
                 config: %{
                   "blocks" => [
                     %{
                       "name" => "text_input_10",
                       "type" => "text_input",
                       "opts" => %{},
                       "ios" => []
                     },
                     %{
                       "name" => "chat",
                       "type" => "chat",
                       "opts" => %{
                         "model_section" => %{
                           "model" => "a",
                           "temperature" => 0,
                           "api_key" => "c",
                           "api_type" => "openai",
                           "endpoint" => "test"
                         }
                       },
                       "ios" => []
                     }
                   ]
                 }
               }
             ] = pipelines

      assert [
               %{
                 config: %{
                   "blocks" => [
                     %{
                       "name" => "text_input_10",
                       "type" => "text_input",
                       "opts" => %{},
                       "ios" => []
                     },
                     %{
                       "name" => "chat",
                       "type" => "chat",
                       "opts" => %{
                         "model_section" => %{
                           "model" => "a",
                           "temperature" => 0,
                           "api_key" => "c",
                           "api_type" => "openai",
                           "endpoint" => "test"
                         }
                       },
                       "ios" => []
                     }
                   ]
                 }
               }
             ] = aliases
    end
  end

  describe "rollback/2" do
    test "correctly removes model_section from chat" do
      pipeline =
        pipeline_fixture(
          %{
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
                  "name" => "chat",
                  "type" => "chat",
                  "opts" => %{
                    "model_section" => %{
                      "model" => "a",
                      "temperature" => 0,
                      "api_key" => "c",
                      "api_type" => "openai",
                      "endpoint" => "test"
                    }
                  },
                  "ios" => []
                }
              ],
              "connections" => []
            }
          },
          %{
            version: "4"
          }
        )

      _alias_1 = alias_fixture(%{pipeline_id: pipeline.id})

      pipelines = Pipelines.list_pipelines()
      aliases = Pipelines.list_aliases()

      %{pipelines: pipelines, aliases: aliases} =
        Buildel.Migrations.AddSectionsToChatBlocks.rollback(pipelines, aliases)

      assert [
               %{
                 config: %{
                   "blocks" => [
                     %{
                       "name" => "text_input_10",
                       "type" => "text_input",
                       "opts" => %{},
                       "ios" => []
                     },
                     %{
                       "name" => "chat",
                       "type" => "chat",
                       "opts" => %{
                         "model" => "a",
                         "temperature" => 0,
                         "api_key" => "c",
                         "api_type" => "openai",
                         "endpoint" => "test"
                       },
                       "ios" => []
                     }
                   ]
                 }
               }
             ] = pipelines

      assert [
               %{
                 config: %{
                   "blocks" => [
                     %{
                       "name" => "text_input_10",
                       "type" => "text_input",
                       "opts" => %{},
                       "ios" => []
                     },
                     %{
                       "name" => "chat",
                       "type" => "chat",
                       "opts" => %{
                         "model" => "a",
                         "temperature" => 0,
                         "api_key" => "c",
                         "api_type" => "openai",
                         "endpoint" => "test"
                       },
                       "ios" => []
                     }
                   ]
                 }
               }
             ] = aliases
    end
  end
end
