defmodule BuildelWeb.MemoryCollectionControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.SecretsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.MemoriesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :read_file,
    :create_collection
  ]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn =
        get(conn, ~p"/api/organizations/#{organization.id}/memory_collections")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not list collections from other org", %{
      conn: conn,
      another_collection: another_collection
    } do
      conn =
        get(conn, ~p"/api/organizations/#{another_collection.organization_id}/memory_collections")

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "lists all organization collections", %{
      conn: conn,
      organization: organization,
      collection: %{id: collection_id},
      api_spec: api_spec
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/memory_collections")

      response = json_response(conn, 200)
      assert [%{"id" => ^collection_id}] = response["data"]

      assert_schema(response, "CollectionIndexResponse", api_spec)
    end

    test "lists all organization collections with collection_name", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      %{id: collection_id} =
        collection_fixture(%{organization_id: organization.id, collection_name: "topic"})

      conn =
        get(conn, ~p"/api/organizations/#{organization}/memory_collections?collection_name=topic")

      response = json_response(conn, 200)
      assert [%{"id" => ^collection_id}] = response["data"]
      assert_schema(response, "CollectionIndexResponse", api_spec)
    end
  end

  describe "show" do
    test_requires_authentication %{conn: conn, organization: organization, collection: collection} do
      get(conn, ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}")
    end

    test "does not show collection from other org", %{
      conn: conn,
      another_collection: another_collection
    } do
      conn =
        get(
          conn,
          ~p"/api/organizations/#{another_collection.organization_id}/memory_collections/#{another_collection.id}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "shows organization collection", %{
      conn: conn,
      organization: organization,
      collection: %{id: collection_id},
      api_spec: api_spec
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/memory_collections/#{collection_id}")

      response = json_response(conn, 200)
      assert %{"id" => ^collection_id} = response["data"]

      assert_schema(response, "CollectionShowResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/memory_collections")
    end

    test "validates name is present", %{conn: conn, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not create in other org", %{conn: conn} do
      organization = organization_fixture()

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: "topic",
          embeddings: %{
            api_type: "openai",
            model: "text-embedding-ada-002",
            secret_name: "some name"
          }
        })

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns :created when valid", %{
      conn: conn,
      pipeline: pipeline,
      organization: organization,
      api_spec: api_spec
    } do
      collection_name = "pipelines:#{pipeline.id}"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: collection_name,
          embeddings: %{
            api_type: "openai",
            model: "text-embedding-ada-002",
            secret_name: "some name"
          }
        })

      response = json_response(conn, 201)

      assert %{
               "data" => %{
                 "name" => ^collection_name,
                 "id" => _
               }
             } = response

      assert_schema(response, "CollectionShowResponse", api_spec)
    end

    test "saves metadata", %{
      conn: conn,
      pipeline: pipeline,
      organization: organization,
      api_spec: api_spec
    } do
      collection_name = "pipelines:#{pipeline.id}"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: collection_name,
          embeddings: %{
            api_type: "openai",
            model: "text-embedding-ada-002",
            secret_name: "some name"
          },
          chunk_size: 420,
          chunk_overlap: 20
        })

      assert %{
               "data" => %{
                 "name" => ^collection_name,
                 "id" => id,
                 "chunk_size" => 420,
                 "chunk_overlap" => 20
               }
             } = json_response(conn, 201)

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{id}"
        )

      response = json_response(conn, 200)

      assert %{
               "data" => %{
                 "id" => ^id,
                 "name" => ^collection_name,
                 "chunk_size" => 420,
                 "chunk_overlap" => 20
               }
             } = response

      assert_schema(response, "CollectionShowResponse", api_spec)
    end
  end

  describe "delete" do
    test_requires_authentication %{conn: conn, organization: organization} do
      delete(conn, ~p"/api/organizations/#{organization.id}/memory_collections/1")
    end

    test "does not delete in other org", %{conn: conn, another_collection: another_collection} do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{another_collection.organization_id}/memory_collections/#{another_collection}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "handles not found", %{
      conn: conn,
      organization: organization,
      another_collection: another_collection
    } do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{another_collection}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "deletes collection", %{conn: conn, organization: organization, collection: collection} do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization}/memory_collections/#{collection}"
        )

      assert json_response(conn, 200) == %{}
    end
  end

  describe "update" do
    test_requires_authentication %{conn: conn, organization: organization} do
      put(conn, ~p"/api/organizations/#{organization.id}/memory_collections/1")
    end

    test "validates name is present", %{
      conn: conn,
      organization: organization,
      collection: collection
    } do
      conn =
        put(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not update in other org", %{conn: conn} do
      organization = organization_fixture()
      collection = collection_fixture(%{organization_id: organization.id})

      conn =
        put(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}",
          %{
            embeddings: %{
              secret_name: "some name"
            }
          }
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns :ok when valid", %{
      conn: conn,
      organization: organization,
      collection: collection,
      api_spec: api_spec
    } do
      collection_id = collection.id
      secret_fixture(%{organization_id: organization.id, name: "new_secret_name"})

      conn =
        put(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}",
          %{
            embeddings: %{
              secret_name: "new_secret_name"
            }
          }
        )

      response = json_response(conn, 200)

      assert %{
               "data" => %{
                 "id" => ^collection_id,
                 "embeddings" => %{
                   "secret_name" => "new_secret_name"
                 },
                 "chunk_size" => 1000,
                 "chunk_overlap" => 0
               }
             } = response

      assert_schema(response, "CollectionShowResponse", api_spec)
    end
  end

  defp read_file(_) do
    %{
      upload_file: %Plug.Upload{
        path: "test/support/fixtures/example.txt",
        filename: "example.txt"
      }
    }
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end

  defp create_collection(%{organization: organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    another_collection = collection_fixture()
    %{collection: collection, another_collection: another_collection}
  end
end
