defmodule BuildelWeb.TestMacros do
  defmacro test_requires_authentication(params \\ quote(do: %{}), do: block) do
    quote do
      test "requires authentication", test_params do
        test_params = update_in(test_params.conn, fn conn -> log_out_user(conn) end)
        unquote(params) = test_params
        conn = unquote(block)
        response = json_response(conn, 401)
        assert_schema(response, "UnauthorizedResponse", test_params.api_spec)
      end
    end
  end
end
