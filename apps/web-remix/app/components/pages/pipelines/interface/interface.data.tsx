export const steps = [
  {
    index: 1,
    heading: "Install the client SDK",
    content: ["Install the client SDK with npm."],
    preview: {
      language: "bash",
      height: 35,
      value: "npm install @buildel/buildel @buildel/buildel-auth",
    },
  },

  {
    index: 2,
    heading: "Initialize client SDK",
    content: [
      "Then, initialize the client SDK with your workspace id, user id, and hashed user id. This will establish your identity with our API and allow you to make authenticated requests using the SDK.",
    ],
    preview: {
      language: "javascript",
      height: 127,
      value: `import { BuildelSocket } from "@buildel/buildel";

const organizationId = 123
const authUrl = '/your-api/auth-endpoint'

const buildel = new BuildelSocket(organizationId, { authUrl });`,
    },
  },
];
