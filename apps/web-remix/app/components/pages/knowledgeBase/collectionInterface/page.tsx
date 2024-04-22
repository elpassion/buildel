import React from "react";
import classNames from "classnames";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { ActionSidebar } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader.server";
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from "~/components/interfaces/InterfaceSection";
import { CodePreviewWrapper } from "~/components/interfaces/CodePreview/CodePreviewWrapper";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";

export function KnowledgeBaseCollectionInterface() {
  const { organizationId, collectionName, collectionId, apiUrl } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const matchSearch = useMatch(
    routes.collectionInterfaceSearch(organizationId, collectionName)
  );
  const isSidebarOpen = !!matchSearch;

  const handleClose = () => {
    navigate(routes.collectionInterface(organizationId, collectionName));
  };

  return (
    <>
      <div>
        <div>
          <h2 className="text-lg text-white font-medium">HTTP API</h2>
          <p className="text-white text-xs mb-6 max-w-lg">
            Access our HTTP API to manage Knowledge Base with capabilities such
            as searching, adding, modifying, and removing documents.
          </p>
        </div>

        <InterfaceSectionWrapper>
          <InterfaceSectionHeader>
            <InterfaceSectionHeading>Search</InterfaceSectionHeading>
            <InterfaceSectionHeaderParagraph>
              Use this endpoint to perform semantic searches.
            </InterfaceSectionHeaderParagraph>
          </InterfaceSectionHeader>

          <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="text-white text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{" "}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="text-primary-500 hover:underline"
                  target="_blank"
                >
                  API key
                </Link>{" "}
                as the bearer token in the Authorization header.
              </p>
            </div>
            <div className="w-full">
              <CodePreviewWrapper
                wrapLines
                value={`curl "${apiUrl}/api/organizations/${organizationId}/memory_collections/${collectionId}/search?query=your_search_term_here" \\
  -X GET \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"`}
                language="shell"
                height={122}
              >
                {(value) => <CopyCodeButton value={value} />}
              </CodePreviewWrapper>
            </div>
          </div>
        </InterfaceSectionWrapper>
      </div>

      <ActionSidebar
        className={classNames("!bg-neutral-950 md:w-[550px]")}
        isOpen={isSidebarOpen}
        onClose={handleClose}
        overlay
      >
        <Outlet />
      </ActionSidebar>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Interface`,
    },
  ];
};
