defmodule Buildel.Blocks.Tool do
  def get_tools(pid) do
    block_name = Buildel.Blocks.Block.block_name(pid)

    GenServer.call(pid, :tools)
    |> Enum.map(fn tool ->
      %{
        tool
        | function: tool.function |> Map.update(:name, nil, &tool_name(block_name, &1))
      }
    end)
  end

  def tool_name(block_name, tool_name) do
    "#{block_name}::#{tool_name}"
  end

  defmacro __using__(_block_opts \\ []) do
    quote do
      @behaviour Buildel.Blocks.ToolBehaviour

      @impl true
      def handle_call(:tools, _from, state) do
        {:reply, tools(state), state}
      end

      @impl true
      def handle_input(
            input,
            {topic, :text, message_json,
             %{tool_name: tool_name, message_id: message_id, send_to: send_to} = metadata},
            %{block: %{name: block_name}} = state
          ) do
        [target_block, tool_name] = tool_name |> String.split("::")

        if target_block == block_name do
          message = Jason.decode!(message_json)
          info = {topic, :text, message, metadata}

          case handle_tool(input, tool_name, info, state) do
            {nil, state} ->
              state

            {response, state} ->
              respond_to_tool(send_to, message_id, response)
              state
          end
        else
          state
        end
      end

      def respond_to_tool(send_to, message_id, response) do
        send(send_to, {:response, :text, response, %{message_id: message_id}})
      end
    end
  end
end

defmodule Buildel.Blocks.ToolBehaviour do
  @callback tools(any()) :: [any()]
  @callback handle_tool(String.t(), String.t(), any(), any()) :: any()
end
