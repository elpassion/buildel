defmodule BuildelWeb.PipelineRunChannelTest do
  alias Buildel.Pipelines
  use BuildelWeb.ChannelCase

  import Buildel.PipelinesFixtures

  describe "join" do
    test "fails when trying to join a run that does not exist", %{socket: socket} do
      assert {:error, %{reason: "not_found", run_id: "non-existent"}} =
               socket
               |> subscribe_and_join(BuildelWeb.PipelineRunChannel, "pipeline_runs:non-existent")
    end

    test "succeeds when trying to join a run that exists", %{socket: socket} do
      run = run_fixture()

      assert {:ok, %{run: ^run}, %Phoenix.Socket{assigns: %{run: ^run}}} =
               socket
               |> subscribe_and_join(BuildelWeb.PipelineRunChannel, "pipeline_runs:#{run.id}")
    end

    setup do
      socket = BuildelWeb.PipelineSocket |> socket()

      %{socket: socket}
    end
  end

  describe "get_blocks" do
    test "returns a list of blocks", %{socket: socket} do
      run = run_fixture()
      blocks = Pipelines.blocks_for_run(run)
      _audio_input_block = blocks |> List.first()
      _chat_block = blocks |> Enum.at(1)
      Buildel.Pipelines.Runner.start_run(run)

      {:ok, %{run: _run}, socket} =
        socket |> subscribe_and_join(BuildelWeb.PipelineRunChannel, "pipeline_runs:#{run.id}")

      ref = socket |> push("get_blocks")
      assert_reply ref, :ok, %{blocks: [%{}, %{}, %{}, %{}]}
    end

    setup do
      socket = BuildelWeb.PipelineSocket |> socket()

      %{socket: socket}
    end
  end

  describe "IO" do
    test "forwards all outputs to topic", %{socket: socket} do
      run = run_fixture()

      [audio_input_block, _chat_block, text_output_block, audio_output_block] =
        Pipelines.blocks_for_run(run)

      Buildel.Pipelines.Runner.start_run(run)

      {:ok, %{run: run}, socket} =
        socket |> subscribe_and_join(BuildelWeb.PipelineRunChannel, "pipeline_runs:#{run.id}")

      payload = {:binary, File.read!("test/support/fixtures/real.mp3")}

      socket
      |> push(
        "block_input_#{Buildel.Pipelines.Worker.block_id(run, audio_input_block)}",
        payload
      )

      topic = "pipeline_runs:#{run.id}"

      event =
        "context:#{Buildel.Pipelines.Worker.context_id(run)}:block:#{audio_output_block.name}:io:output"

      assert_receive %Phoenix.Socket.Broadcast{
        topic: ^topic,
        event: ^event,
        payload: ^payload
      }

      event =
        "context:#{Buildel.Pipelines.Worker.context_id(run)}:block:#{text_output_block.name}:io:output"

      payload = %{message: "Hello"}

      assert_receive %Phoenix.Socket.Message{
        topic: ^topic,
        event: ^event,
        payload: ^payload
      }
    end

    setup do
      socket = BuildelWeb.PipelineSocket |> socket()

      %{socket: socket}
    end
  end
end
