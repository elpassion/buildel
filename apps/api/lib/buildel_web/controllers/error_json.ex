defmodule BuildelWeb.ErrorJSON do
  # If you want to customize a particular status code,
  # you may add your own clauses, such as:
  #
  # def render("500.json", _assigns) do
  #   %{errors: %{detail: "Internal Server Error"}}
  # end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.json" becomes
  # "Not Found".

  def render("billing_error.json", assigns) do
    message = Map.get(assigns, :custom_message, "Billing error")
    %{errors: %{detail: message, error_code: :BILLING_LIMIT_EXCEEDED}}
  end

  def render(template, assigns) do
    message =
      Map.get(assigns, :custom_message, Phoenix.Controller.status_message_from_template(template))

    %{errors: %{detail: message}}
  end
end
