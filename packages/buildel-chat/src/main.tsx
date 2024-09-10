import React from "react";
import ReactDOM from "react-dom/client";

import { ExampleWebchat } from "./ExampleWebchat.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-[100dvh] flex justify-center items-center h-[100dvh] w-full bg-secondary">
      <ExampleWebchat
        className="h-full grow"
        pipeline={{
          id: 168,
          name: "AI Chat",
          interface_config: {
            webchat: {
              inputs: [
                {
                  name: "text_input_1",
                  type: "text_input",
                },
                {
                  name: "text_input_2",
                  type: "text_input",
                },
                {
                  name: "text_input_3",
                  type: "text_input",
                },
              ],
              outputs: [
                {
                  name: "Assistant",
                  type: "text_output",
                },
                {
                  name: "Translator",
                  type: "text_output",
                },
              ],
              public: true,
              description: "Hello. How can I help you today?",
              suggested_messages: [
                "Give me a quiz on the latest fashion trends",
                "Help me get organized with a list of 10 tips",
                "Plan a low-carb meal with what's available in my fridge",
                "Find the best running trails nearby",
                "Cześć! Jak mogę Ci dzisiaj pomóc?",
              ],
            },
          },
        }}
        pipelineId={"168"}
        organizationId={"13"}
      />
    </div>
  </React.StrictMode>,
);
