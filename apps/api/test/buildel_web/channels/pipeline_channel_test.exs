defmodule BuildelWeb.PipelineChannelTest do
  use BuildelWeb.ChannelCase

  import Buildel.PipelinesFixtures
  import Buildel.OrganizationsFixtures

  describe "join" do
    test "fails when starting a pipeline that does not exist", %{socket: socket} do
      assert {:error, %{reason: "not_found"}} =
               socket
               |> subscribe_and_join(BuildelWeb.PipelineChannel, "pipelines:org:non-existent")
    end

    test "fails when trying to join a pipeline that is from another organization", %{
      socket: socket
    } do
      pipeline = pipeline_fixture()

      assert {:error, %{reason: "not_found"}} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}"
               )
    end

    test "succeeds when trying to join a run that exists", %{
      socket: socket,
      organization: organization
    } do
      pipeline = pipeline_fixture(%{organization_id: organization.id})

      assert {:ok, %{}, %Phoenix.Socket{assigns: %{run: %{}}}} =
               socket
               |> subscribe_and_join(
                 BuildelWeb.PipelineChannel,
                 "pipelines:#{pipeline.organization_id}:#{pipeline.id}"
               )
    end
  end

  describe "IO" do
    test "outputs all outputs to socket", %{socket: socket, organization: organization} do
      pipeline =
        pipeline_fixture(%{
          organization_id: organization.id
        })

      {:ok, %{run: _run}, socket} =
        socket
        |> subscribe_and_join(
          BuildelWeb.PipelineChannel,
          "pipelines:#{pipeline.organization_id}:#{pipeline.id}"
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
    organization = organization_fixture()

    socket = BuildelWeb.PipelineSocket |> socket(nil, %{organization: organization})

    %{socket: socket, organization: organization}
  end
end
