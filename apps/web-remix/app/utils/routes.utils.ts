export const routes = {
  dashboard: "/",
  login: "/login",
  register: "/register",
  organizations: "/organizations",
  organization: (organizationId: OrganizationId) => `/${organizationId}`,
  newOrganization: () => `${routes.organizations}/new`,
  settings: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/settings`,
  organizationSettings: (organizationId: OrganizationId) =>
    `${routes.settings(organizationId)}/organization`,
  membershipsNew: (organizationId: OrganizationId) =>
    `${routes.organizationSettings(organizationId)}/memberships/new`,
  profileSettings: (organizationId: OrganizationId) =>
    `${routes.settings(organizationId)}/profile`,
  profileSettingsChangePassword: (organizationId: OrganizationId) =>
    `${routes.profileSettings(organizationId)}/change-password`,
  pipelines: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines`,
  pipeline: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelines(organizationId)}/${pipelineId}`,
  pipelineRuns: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/runs`,
  pipelineRun: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    runId: RunId
  ) => `${routes.pipelineRuns(organizationId, pipelineId)}/${runId}`,
  pipelineRunCosts: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    runId: RunId
  ) => `${routes.pipelineRun(organizationId, pipelineId, runId)}/costs`,
  pipelineInterface: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/interface`,
  pipelineClientSDK: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelineInterface(organizationId, pipelineId)}/client-sdk`,
  pipelineWebsiteChatbot: (
    organizationId: OrganizationId,
    pipelineId: PipelineId
  ) =>
    `${routes.pipelineInterface(organizationId, pipelineId)}/website-chatbot`,
  pipelineOpenAIApi: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelineInterface(organizationId, pipelineId)}/openai-api`,
  pipelineSettings: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/settings`,
  pipelineSettingsConfiguration: (
    organizationId: OrganizationId,
    pipelineId: PipelineId
  ) => `${routes.pipelineSettings(organizationId, pipelineId)}/configuration`,
  pipelinesNew: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines/new`,
  knowledgeBase: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/knowledge-base`,
  knowledgeBaseNew: (organizationId: OrganizationId) =>
    `${routes.knowledgeBase(organizationId)}/new`,
  collectionFiles: (organizationId: OrganizationId, collectionName: string) =>
    `${routes.knowledgeBase(organizationId)}/${encodeURIComponent(
      collectionName
    )}`,
  collectionFilesNew: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.collectionFiles(organizationId, collectionName)}/new`,
  secrets: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/secrets`,
  secretsNew: (organizationId: OrganizationId) =>
    `${routes.secrets(organizationId)}/new`,
  chatPreview: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `/webchats${routes.pipeline(organizationId, pipelineId)}`,
};

type OrganizationId = string | number;
type PipelineId = string | number;
type RunId = string | number;
