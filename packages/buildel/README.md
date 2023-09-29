## 🚀 Buildel
A flexible library for integrating with the Buildel service via WebSockets.
Enables easy connection, and real-time event handling within the context of organizations and pipelines.


### Installation
To install the package using npm:

```bash
npm install @buildel/buildel
```

### Usage

#### Initialization
❗Before proceeding, ensure you have set up an authentication endpoint that will return authentication data for your websocket connection. 
The **Buildel team** has provided the  [@buildel/buildel-auth](https://www.npmjs.com/package/@buildel/buildel-auth) package to assist you in this process.
```ts
import { BuildelSocket } from "@buildel/buildel";

const organizationId = 123
const authUrl = '/your-api/auth-endpoint'

const buildel = new BuildelSocket(organizationId, { authUrl });
```

#### Connection

```ts
await buildel.connect();

// ... your operations ...

await buildel.disconnect();
```

#### Event handling 
Run a pipeline and handle events:

```ts
const workflowId = 123
const run = buildel.run(workflowId, {
  onBlockOutput: (blockId, outputName, payload) => {
    console.log(`Output from block ${blockId}, output ${outputName}:`, payload);
  },
  onBlockStatusChange: (blockId, isWorking) => {
    console.log(`Block ${blockId} is ${isWorking ? "working" : "stopped"}`);
  },
  onStatusChange: (status) => {
    console.log(`Status changed: ${status}`);
  }
})
```

#### Pushing data
Send data to the channel:
```ts
await run.start()

run.push("your_block_name:input", 'sample payload');
```

### License
This project is licensed under the MIT License.
