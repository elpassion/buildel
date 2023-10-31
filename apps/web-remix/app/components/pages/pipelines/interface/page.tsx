import React from "react";
import { MetaFunction } from "@remix-run/node";
import { CodePreview } from "./CodePreview";
import { steps } from "./interface.data";
import {
  PreviewSection,
  PreviewSectionContent,
  PreviewSectionHeader,
  PreviewSectionHeading,
  PreviewSectionStep,
  PreviewSectionText,
} from "./PreviewSection";

export function InterfacePage() {
  return (
    <div className="pt-5">
      <h2 className="text-lg text-white font-medium">Client SDK</h2>
      <p className="text-white text-xs mb-6">
        Access out Buildel API easily with our client SDK.
      </p>

      {steps.map((step) => (
        <PreviewSection key={step.index}>
          <PreviewSectionHeader>
            <PreviewSectionStep>{step.index}</PreviewSectionStep>
            <PreviewSectionHeading>{step.heading}</PreviewSectionHeading>
          </PreviewSectionHeader>

          <PreviewSectionContent>
            {step.content.map((text, index) => (
              <PreviewSectionText key={index}>{text}</PreviewSectionText>
            ))}

            <div>
              <CodePreview
                value={step.preview.value}
                language={step.preview.language}
                height={step.preview.height}
              />
            </div>
          </PreviewSectionContent>
        </PreviewSection>
      ))}
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
