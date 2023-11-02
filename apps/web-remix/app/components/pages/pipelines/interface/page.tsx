import React from "react";
import { routes } from "~/utils/routes.utils";
import { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  PreviewSection,
  PreviewSectionContent,
  PreviewSectionHeader,
  PreviewSectionHeading,
  PreviewSectionStep,
  PreviewSectionText,
} from "./PreviewSection";
import { CodePreviewWrapper } from "./CodePreview";
import { CodePreviewOptions } from "./CodePreviewOptions";
import { CopyCodeButton } from "./CopyCodeButton";
import { loader } from "./loader";

export function InterfacePage() {
  const { organizationId, pipelineId } = useLoaderData<typeof loader>();
  return (
    <div className="pt-5">
      <h2 className="text-lg text-white font-medium">Client SDK</h2>
      <p className="text-white text-xs mb-6">
        Access our Buildel API easily with our client SDK.
      </p>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>1</PreviewSectionStep>
          <PreviewSectionHeading>
            Install Buildel packages
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              Begin by installing the necessary Buildel packages using npm. This
              initial step equips you with the tools required for seamless
              integration with our API.
            </PreviewSectionText>
          </div>

          <CodePreviewWrapper
            value="npm install @buildel/buildel @buildel/buildel-auth"
            language="bash"
            height={35}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>2</PreviewSectionStep>
          <PreviewSectionHeading>
            Server side configuration
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              To authenticate with our API via the SDK, it’s essential to secure
              your socket connection at the backend. Our{" "}
              <strong>@buildel/buildel-auth</strong> package simplifies this
              process.
            </PreviewSectionText>
            <PreviewSectionText>
              Set up an HTTP endpoint on your server and use the{" "}
              <Link
                to={routes.organizationSettings(organizationId)}
                className="text-primary-500 hover:underline"
              >
                API key
              </Link>{" "}
              to hash your socket connection.
            </PreviewSectionText>
          </div>

          <CodePreviewOptions
            options={[
              {
                id: 0,
                framework: "Next.js",
                value: `import { BuildelAuth } from "@buildel/buildel-auth";

export async function POST(request: Request) {
  const { socket_id: socketId, channel_name: channelName } = await request.json();

  const buildelAuth = new BuildelAuth(process.env.BUILDEL_API_KEY);

  const authData = buildelAuth.generateAuth(socketId, channelName);

  return NextResponse.json(authData);
}`,
                height: 215,
              },
              {
                id: 1,
                framework: "Remix",
                value: `import { BuildelAuth } from "@buildel/buildel-auth"

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const socketId = body.get("socketId") as string;
  const channelName = body.get("channelName") as string;

  const buildelAuth = new BuildelAuth(process.env.BUILDEL_API_KEY);

  const authData = buildelAuth.generateAuth(socketId, channelName);

  return json({ authData });
}`,
                height: 250,
              },
            ]}
          />
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>3</PreviewSectionStep>
          <PreviewSectionHeading>Initialize client SDK</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              Initiate the client SDK with your organization's identifier to
              validate your credentials. This establishes your organization's
              identity within the SDK's scope.
            </PreviewSectionText>

            <PreviewSectionText>
              Behind the scenes, the SDK will query an endpoint at the specified
              address (step 2) to retrieve the hashed credentials required for a
              secure websocket connection.
            </PreviewSectionText>
          </div>

          <CodePreviewWrapper
            value={`import { BuildelSocket } from "@buildel/buildel";

const buildel = new BuildelSocket(${organizationId}, { authUrl: '/your-api/auth-endpoint' });`}
            language="typescript"
            height={70}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>4</PreviewSectionStep>
          <PreviewSectionHeading>Connect websockets</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              Establish a connection to our websocket server to engage in
              real-time bidirectional communication. This connection is vital
              for real-time messaging and data interchange.
            </PreviewSectionText>
          </div>

          <CodePreviewWrapper
            value="await buildel.connect();"
            language="typescript"
            height={35}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>5</PreviewSectionStep>
          <PreviewSectionHeading>Initialize run instance</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              Initialize a run instance with your workflow ID to manage events
              for specific blocks, handle errors, and perform other workflow
              operations.
            </PreviewSectionText>
          </div>

          <CodePreviewWrapper
            value={`const run = buildel.run(${pipelineId}, {
  onBlockOutput: ( blockId: string, outputName: string, payload: unknown) => {
    console.log(\`Output from block \${blockId}, output \${outputName}:\`, payload);
  },
  onBlockStatusChange: (blockId: string, isWorking: boolean) => {
    console.log(\`Block \${blockId} is \${isWorking ? "working" : "stopped"}\`);
  },
  onStatusChange: (status: BuildelRunStatus) => {
    console.log(\`Status changed: \${status}\`);
  },
  onBlockError: (blockId: string, errors: string[]) => {
    console.log(\`Block \${blockId} errors: \${errors}\`);
  }
})`}
            language="typescript"
            height={270}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>6</PreviewSectionStep>
          <PreviewSectionHeading>Send data to channel</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              After starting your run instance, send data payloads to a
              specified block in your channel. This action triggers the
              processing within your run.
            </PreviewSectionText>
          </div>

          <div>
            <CodePreviewWrapper
              value={`await run.start()
run.push("your_block_name:input", 'sample payload');`}
              language="typescript"
              height={55}
            >
              {(value) => <CopyCodeButton value={value} />}
            </CodePreviewWrapper>
          </div>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>7</PreviewSectionStep>
          <PreviewSectionHeading>Close connection</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <div className="space-y-2">
            <PreviewSectionText>
              When your interactions with the API conclude, ensure you properly
              close the socket connection. This step is critical for releasing
              resources and securely disconnecting from the server.
            </PreviewSectionText>
          </div>

          <div>
            <CodePreviewWrapper
              value={`await buildel.disconnect();`}
              language="typescript"
              height={35}
            >
              {(value) => <CopyCodeButton value={value} />}
            </CodePreviewWrapper>
          </div>
        </PreviewSectionContent>
      </PreviewSection>
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Interface",
    },
  ];
};
