## Buildel-auth
A library that generates authentication data for socket connection with the Buildel service.

### Installation
To install the package using npm:

```bash
npm install @buildel/buildel-auth
```

### Usage

```ts
import {BuildelAuth} from "@buildel/buildel-auth";

// initialize BuildelAuth class
const buildelAuth = new BuildelAuth(process.env.BUILDEL_SECRET); 

// generate auth data for your socket connection
const authData = buildelAuth.generateAuth(socketId, channelName);
```

### License
This project is licensed under the MIT License.
