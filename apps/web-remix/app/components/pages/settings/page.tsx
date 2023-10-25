import { ActionFunctionArgs, json, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import React from "react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { Form, SampleTextInputField } from "~/components/form/Form";
import { parse } from "@conform-to/zod";
import z from "zod";
import { Button } from "@elpassion/taco";
import { actionBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";

const schema = z.object({
  email: z.string().email(),
});
export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, "Missing organizationId");
      const formData = await request.formData();
      const result = parse(formData, { schema });

      console.log(result);

      return json({});
    },
  })(actionArgs);
}

export function SettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Settings</AppNavbarHeading>} />
      <PageContentWrapper>
        <Form
          onValidate={({ formData }) => {
            return parse(formData, {
              schema,
            });
          }}
          method="post"
        >
          <SampleTextInputField
            name="email"
            label="email"
            supportingText="Your email"
          />
          <Button type="submit">submit</Button>
        </Form>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
