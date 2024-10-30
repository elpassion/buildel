defmodule BuildelWeb.PipelineChannelTest do
  use BuildelWeb.ChannelCase

  import Buildel.PipelinesFixtures
  import Buildel.OrganizationsFixtures
  import Buildel.AccountsFixtures
  import Buildel.CostsFixtures

  describe "join" do
    test "fails when starting a pipeline with invalid token", %{
      socket: socket,
      organization: organization
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      assert {:error, %{reason: "unauthorized"}} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                 %{auth: "invalid-token", user_data: "{}"}
               )
    end

    test "succeeds when trying to join a run for pipeline that exists", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      user_data = Jason.encode!(%{user_id: user.id})

      assert {:ok, %{}, %Phoenix.Socket{assigns: %{run: %{}}}} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                 %{
                   auth:
                     BuildelWeb.ChannelAuth.create_auth_token(
                       "socket_id",
                       "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                       user_data,
                       organization.api_key
                     ),
                   user_data: user_data
                 }
               )
    end

    test "fails when trying to join a run for pipeline with exceeded budged", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      run =
        run_fixture(%{pipeline_id: pipeline.id})

      Buildel.Pipelines.update_pipeline(pipeline, %{budget_limit: 90})
      create_cost(%{organization: organization, run: run})

      user_data = Jason.encode!(%{user_id: user.id})

      assert {:error, %{reason: "Budget limit exceeded"}} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                 %{
                   auth:
                     BuildelWeb.ChannelAuth.create_auth_token(
                       "socket_id",
                       "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                       user_data,
                       organization.api_key
                     ),
                   user_data: user_data
                 }
               )
    end

    test "succeeds when trying to join a run for pipeline without budget limit set", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      run =
        run_fixture(%{pipeline_id: pipeline.id})

      create_cost(%{organization: organization, run: run})

      user_data = Jason.encode!(%{user_id: user.id})

      assert {:ok, %{run: _joined_run}, _socket} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                 %{
                   auth:
                     BuildelWeb.ChannelAuth.create_auth_token(
                       "socket_id",
                       "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                       user_data,
                       organization.api_key
                     ),
                   user_data: user_data
                 }
               )
    end

    test "succeeds when trying to join a run for pipeline with budget limit not exceeded", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      run =
        run_fixture(%{pipeline_id: pipeline.id})

      Buildel.Pipelines.update_pipeline(pipeline, %{budget_limit: 110})
      create_cost(%{organization: organization, run: run})

      user_data = Jason.encode!(%{user_id: user.id})

      assert {:ok, %{run: _joined_run}, _socket} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                 %{
                   auth:
                     BuildelWeb.ChannelAuth.create_auth_token(
                       "socket_id",
                       "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                       user_data,
                       organization.api_key
                     ),
                   user_data: user_data
                 }
               )
    end

    test "succeeds when trying to join a run that is already started", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      {:ok, run} =
        run_fixture(%{pipeline_id: pipeline.id}) |> Buildel.Pipelines.Runner.start_run()

      user_data = Jason.encode!(%{user_id: user.id})

      {:ok, %{run: joined_run}, _socket} =
        socket
        |> subscribe_and_join(
          BuildelWeb.PipelineChannel,
          "pipelines:#{pipeline.organization_id}:#{pipeline.id}:#{run.id}",
          %{
            auth:
              BuildelWeb.ChannelAuth.create_auth_token(
                "socket_id",
                "pipelines:#{pipeline.organization_id}:#{pipeline.id}:#{run.id}",
                user_data,
                organization.api_key
              ),
            user_data: user_data
          }
        )

      assert %{id: run.id} == %{id: joined_run.id}
    end
  end

  describe "IO" do
    test "outputs all outputs to socket", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      user_data = Jason.encode!(%{user_id: user.id})

      pipeline =
        pipeline_fixture(%{
          organization_id: organization.id
        })

      {:ok, %{run: _run}, socket} =
        socket
        |> subscribe_and_join(
          BuildelWeb.PipelineChannel,
          "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
          %{
            auth:
              BuildelWeb.ChannelAuth.create_auth_token(
                "socket_id",
                "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                user_data,
                organization.api_key
              ),
            user_data: user_data
          }
        )

      payload = {:binary, File.read!("test/support/fixtures/real.mp3")}

      socket |> push("input:random_block:input", payload)

      event = "output:random_block_4:output"

      assert_receive %Phoenix.Socket.Message{
        event: ^event,
        payload: {:binary, binary_payload}
      }

      {chunk, metadata} = extract_binary_metadata(binary_payload)

      assert %{
               "metadata" => _,
               "created_at" => _
             } = metadata

      assert chunk == File.read!("test/support/fixtures/real.mp3")

      event = "output:random_block_3:output"

      assert_receive %Phoenix.Socket.Message{
        event: ^event,
        payload: text_payload
      }

      assert %{message: "Hello", created_at: _, metadata: _} = text_payload
    end

    test "outputs only outputs allowed in the interface", %{
      socket: socket,
      organization: organization,
      user: user
    } do
      user_data = Jason.encode!(%{user_id: user.id})

      pipeline =
        pipeline_fixture(%{
          organization_id: organization.id,
          interface_config: %{
            "webchat" => %{"outputs" => [%{"name" => "random_block_4", "type" => "audio_output"}]}
          }
        })

      {:ok, %{run: _run}, socket} =
        socket
        |> subscribe_and_join(
          BuildelWeb.PipelineChannel,
          "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
          %{
            auth:
              BuildelWeb.ChannelAuth.create_auth_token(
                "socket_id",
                "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
                user_data,
                organization.api_key
              ),
            user_data: user_data,
            metadata: %{"interface" => "webchat"}
          }
        )

      payload = {:binary, File.read!("test/support/fixtures/real.mp3")}

      socket |> push("input:random_block:input", payload)

      event = "output:random_block_4:output"

      assert_receive %Phoenix.Socket.Message{
        event: ^event,
        payload: {:binary, binary_payload}
      }

      {chunk, metadata} = extract_binary_metadata(binary_payload)

      assert %{
               "metadata" => _,
               "created_at" => _
             } = metadata

      assert chunk == File.read!("test/support/fixtures/real.mp3")

      event = "output:random_block_3:output"
      payload = %{message: "Hello"}

      refute_receive %Phoenix.Socket.Message{
        event: ^event,
        payload: ^payload
      }
    end
  end

  describe "public" do
    test "allows connecting to public interfaces without auth", %{
      socket: socket,
      organization: organization
    } do
      pipeline =
        pipeline_fixture(%{
          organization_id: organization.id,
          interface_config: %{"webchat" => %{"public" => true}}
        })

      {:ok, %{run: _run}, _socket} =
        socket
        |> subscribe_and_join(
          BuildelWeb.PipelineChannel,
          "pipelines:#{pipeline.organization_id}:#{pipeline.id}",
          %{
            "metadata" => %{
              "interface" => "webchat"
            }
          }
        )
    end
  end

  setup do
    user = user_fixture()
    organization = organization_fixture(%{user_id: user.id})
    socket = BuildelWeb.PipelineSocket |> socket("socket_id", %{})

    %{socket: socket, user: user, organization: organization}
  end

  defp extract_binary_metadata(binary) do
    <<metadata_size::32, rest::binary>> = binary
    <<metadata_json::binary-size(metadata_size), chunk::binary>> = rest
    metadata = Jason.decode!(metadata_json)
    {chunk, metadata}
  end

  defp create_cost(%{organization: organization, run: run}) do
    cost_fixture(organization, run)
  end
end
