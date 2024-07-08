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

  defmacro __using__(block_opts \\ []) do
    parallel =
      block_opts
      |> Keyword.get(:parallel, [])

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
          state = state |> Map.put(:message_id, message_id) |> Map.put(:send_to, send_to)
          info = {topic, :text, message, metadata}

          if unquote(parallel) |> Enum.member?(tool_name) do
            Task.start(fn -> handle_tool(input, tool_name, info, state) end)
            state
          else
            handle_tool(input, tool_name, info, state)
          end
        else
          state
        end
      end

      def respond_to_tool({:text, content, %{send_to: send_to, message_id: message_id}}) do
        send(
          send_to,
          {:response, :text, content, %{message_id: message_id}}
        )
      end
    end
  end
end

defmodule Buildel.Blocks.ToolBehaviour do
  @callback tools(any()) :: [any()]
  @callback handle_tool(String.t(), String.t(), any(), any()) :: any()
end
