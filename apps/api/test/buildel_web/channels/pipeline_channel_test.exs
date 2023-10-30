defmodule BuildelWeb.PipelineChannelTest do
  use BuildelWeb.ChannelCase

  import Buildel.PipelinesFixtures
  import Buildel.OrganizationsFixtures
  import Buildel.AccountsFixtures

  describe "join" do
    test "fails when starting a pipeline without token", %{socket: socket} do
      assert {:error,
              %{
                reason: "invalid",
                errors: %{auth: ["can't be blank"], user_data: ["can't be blank"]}
              }} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:org:non-existent",
                 %{}
               )
    end

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

    test "succeeds when trying to join a run that exists", %{
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
        payload: ^payload
      }

      event = "output:random_block_3:output"
      payload = %{message: "Hello"}

      assert_receive %Phoenix.Socket.Message{
        event: ^event,
        payload: ^payload
      }
    end
  end

  setup do
    user = user_fixture()
    organization = organization_fixture(%{user_id: user.id})
    socket = BuildelWeb.PipelineSocket |> socket("socket_id", %{})

    %{socket: socket, user: user, organization: organization}
  end
end
