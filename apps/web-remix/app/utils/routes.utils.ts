export const routes = {
  dashboard: "/",
  login: "/login",
  register: "/register",
  settings: "/settings",
  organizations: "/organizations",
  organization: (organizationId: OrganizationId) => `/${organizationId}`,
  newOrganization: () => `${routes.organizations}/new`,
  pipelines: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines`,
  pipeline: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelines(organizationId)}/${pipelineId}`,
  pipelineRuns: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/overview`,
  pipelineInterface: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/interface`,
  pipelineSettings: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/settings`,
  pipelinesNew: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines/new`,
  knowledgeBase: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/knowledge-base`,
  knowledgeBaseNew: (organizationId: OrganizationId) =>
    `${routes.knowledgeBase(organizationId)}/new`,
  collectionFiles: (organizationId: OrganizationId, collectionName: string) =>
    `${routes.knowledgeBase(organizationId)}/${collectionName}`,
  collectionFilesNew: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.collectionFiles(organizationId, collectionName)}/new`,
  secrets: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/secrets`,
  secretsNew: (organizationId: OrganizationId) =>
    `${routes.secrets(organizationId)}/new`,
  apiKeys: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/api-keys`,
  apiKeysNew: (organizationId: OrganizationId) =>
    `${routes.apiKeys(organizationId)}/new`,
};

type OrganizationId = string | number;
type PipelineId = string | number;
