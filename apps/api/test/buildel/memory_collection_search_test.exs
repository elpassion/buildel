defmodule Buildel.MemoryCollectionSearchTest do
  use ExUnit.Case

  alias Buildel.Memories.MemoryCollectionSearch

  setup do
    on_exit(fn ->
      Application.put_env(:buildel, :vectordb_mock_query_hook, nil)
      Application.put_env(:buildel, :vectordb_mock_get_all_hook, nil)
      Application.put_env(:buildel, :vectordb_mock_get_by_parent_hook, nil)
    end)
  end

  setup do
    setup_and_mock_vectordb()
  end

  describe "search/2" do
    test "should return chunks and count tokens", %{vector_db: vector_db} do
      search =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: "1_1"
        })

      params = MemoryCollectionSearch.Params.from_map(%{})

      assert {[
                %{
                  "document" => "Lorem ipsum dolor sit amet"
                }
              ], 5, _} = MemoryCollectionSearch.search(search, params)
    end

    test "should return chunks with neighbors", %{vector_db: vector_db} do
      search =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: "1_1"
        })

      params =
        MemoryCollectionSearch.Params.from_map(%{
          extend_neighbors: true
        })

      assert {[
                %{
                  "document" => "parent parent parent Lorem ipsum dolor sit amet next next next",
                  "metadata" => %{
                    "pages" => [1, 2]
                  }
                }
              ], 11, _} = MemoryCollectionSearch.search(search, params)
    end

    test "should correctly return pages when neighbors are null", %{vector_db: vector_db} do
      Application.put_env(:buildel, :vectordb_mock_query_hook, fn _collection,
                                                                  _metadata,
                                                                  _params ->
        {:ok,
         [
           %{
             "document" => "Lorem ipsum dolor sit amet",
             "chunk_id" => UUID.uuid4(),
             "similarity" => 0.95,
             "metadata" => %{
               "building_block_ids" => [],
               "file_name" => "Ustawa o zmianie ustawy.pdf",
               "index" => 44,
               "keywords" => ["ZAŁĄCZNIKI"],
               "memory_id" => 23,
               "next" => nil,
               "pages" => [1],
               "parent" => nil,
               "prev" => nil
             }
           }
         ]}
      end)

      search =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: "1_1"
        })

      params =
        MemoryCollectionSearch.Params.from_map(%{
          extend_neighbors: true
        })

      assert {[
                %{
                  "document" => " Lorem ipsum dolor sit amet ",
                  "metadata" => %{
                    "pages" => [1]
                  }
                }
              ], 6, _} = MemoryCollectionSearch.search(search, params)
    end

    test "should return chunks with parent context", %{vector_db: vector_db} do
      search =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: "1_1"
        })

      params =
        MemoryCollectionSearch.Params.from_map(%{
          extend_parents: true
        })

      assert {[
                %{
                  "document" => "parent parent parent Lorem ipsum dolor sit amet",
                  "metadata" => %{
                    "pages" => [1]
                  }
                }
              ], 8, _} = MemoryCollectionSearch.search(search, params)
    end

    test "should limit results by token count", %{vector_db: vector_db} do
      search =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: "1_1"
        })

      params =
        MemoryCollectionSearch.Params.from_map(%{
          token_limit: 5
        })

      assert {[
                %{
                  "document" => "Lorem ipsum dolor sit amet"
                }
              ], 5, _} = MemoryCollectionSearch.search(search, params)

      params =
        MemoryCollectionSearch.Params.from_map(%{
          extend_parents: true,
          token_limit: 5
        })

      assert {[], 0, _} = MemoryCollectionSearch.search(search, params)
    end
  end

  defp setup_and_mock_vectordb() do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.ClientMocks.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: "test",
            model: "buildel",
            api_key: "buildel",
            endpoint: "test"
          })
      })

    first_id = UUID.uuid4()
    second_id = UUID.uuid4()
    third_id = UUID.uuid4()

    first_parent_id = UUID.uuid4()
    first_next_id = UUID.uuid4()

    Application.put_env(:buildel, :vectordb_mock_query_hook, fn _collection, _metadata, _params ->
      {:ok,
       [
         %{
           "document" => "Lorem ipsum dolor sit amet",
           "chunk_id" => first_id,
           "similarity" => 0.95,
           "metadata" => %{
             "building_block_ids" => [],
             "file_name" => "Ustawa o zmianie ustawy.pdf",
             "index" => 44,
             "keywords" => ["ZAŁĄCZNIKI"],
             "memory_id" => 23,
             "next" => first_next_id,
             "pages" => [1],
             "parent" => first_parent_id,
             "prev" => first_parent_id
           }
         }
       ]}
    end)

    Application.put_env(:buildel, :vectordb_mock_get_all_hook, fn _collection,
                                                                  _metadata,
                                                                  _params ->
      [
        %{
          "document" => "parent parent parent",
          "chunk_id" => first_parent_id,
          "similarity" => 0.90,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 43,
            "keywords" => ["ZAŁĄCZNIKI"],
            "memory_id" => 23,
            "next" => first_id,
            "pages" => [1],
            "parent" => nil,
            "prev" => nil
          }
        },
        %{
          "document" => "Lorem ipsum dolor sit amet",
          "chunk_id" => first_id,
          "similarity" => 0.95,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 44,
            "keywords" => ["ZAŁĄCZNIKI"],
            "memory_id" => 23,
            "next" => first_next_id,
            "pages" => [1],
            "parent" => first_parent_id,
            "prev" => first_parent_id
          }
        },
        %{
          "document" => "next next next",
          "chunk_id" => first_next_id,
          "similarity" => 0.90,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 45,
            "keywords" => ["ZAŁĄCZNIKI"],
            "memory_id" => 23,
            "next" => first_id,
            "pages" => [2],
            "parent" => nil,
            "prev" => first_id
          }
        },
        %{
          "document" => "consectetur adipiscing elit",
          "chunk_id" => second_id,
          "similarity" => 0.83,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 88,
            "keywords" => ["PASYWA"],
            "memory_id" => 23,
            "next" => third_id,
            "pages" => [7],
            "parent" => nil,
            "prev" => nil
          }
        },
        %{
          "document" => "foo",
          "chunk_id" => third_id,
          "similarity" => 0.83,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 89,
            "keywords" => ["PASYWA"],
            "memory_id" => 23,
            "next" => nil,
            "pages" => [7],
            "parent" => nil,
            "prev" => second_id
          }
        }
      ]
    end)

    Application.put_env(:buildel, :vectordb_mock_get_by_parent_hook, fn _collection, _parent_id ->
      [
        %{
          "document" => "parent parent parent",
          "chunk_id" => first_parent_id,
          "similarity" => 0.90,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 43,
            "keywords" => ["ZAŁĄCZNIKI"],
            "memory_id" => 23,
            "next" => first_id,
            "pages" => [1],
            "parent" => nil,
            "prev" => nil
          }
        },
        %{
          "document" => "Lorem ipsum dolor sit amet",
          "chunk_id" => first_id,
          "similarity" => 0.95,
          "metadata" => %{
            "building_block_ids" => [],
            "file_name" => "Ustawa o zmianie ustawy.pdf",
            "index" => 44,
            "keywords" => ["ZAŁĄCZNIKI"],
            "memory_id" => 23,
            "next" => first_next_id,
            "pages" => [1],
            "parent" => first_parent_id,
            "prev" => first_parent_id
          }
        }
      ]
    end)

    %{vector_db: vector_db}
  end
end
