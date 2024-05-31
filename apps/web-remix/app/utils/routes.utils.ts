import { Params } from "@remix-run/react";
import { buildUrlWithParams } from "~/utils/url";

type RouteParam = Record<string, string | number>;

export const routes = {
  dashboard: "/",
  login: "/login",
  register: "/register",
  resetPassowrd: () => "/reset-password",
  resetPasswordSent: () => "/reset-password/sent",
  organizations: "/organizations",
  organization: (organizationId: OrganizationId) => `/${organizationId}`,
  newOrganization: () => `${routes.organizations}/new`,
  settings: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/settings`,
  organizationSettings: (organizationId: OrganizationId) =>
    `${routes.settings(organizationId)}/organization`,
  organizationInvitations: (organizationId: OrganizationId) =>
    `${routes.organizationSettings(organizationId)}/invitations`,
  organizationInvitationsNew: (organizationId: OrganizationId) =>
    `${routes.organizationInvitations(organizationId)}/new`,
  profileSettings: (organizationId: OrganizationId) =>
    `${routes.settings(organizationId)}/profile`,
  profileSettingsChangePassword: (organizationId: OrganizationId) =>
    `${routes.profileSettings(organizationId)}/change-password`,
  pipelines: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines`,
  pipeline: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelines(organizationId)}/${pipelineId}`,
  pipelineBuild: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipeline(organizationId, pipelineId)}/build`,
      params
    ),
  pipelineBlocks: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelineBuild(organizationId, pipelineId)}/blocks`,
  pipelineEditBlock: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    blockName: string,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineBlocks(organizationId, pipelineId)}/${blockName}`,
      params
    ),
  pipelineRuns: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipeline(organizationId, pipelineId)}/runs`,
      params
    ),
  pipelineRun: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    runId: RunId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineRuns(organizationId, pipelineId)}/${runId}`,
      params
    ),
  pipelineRunCosts: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    runId: RunId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineRun(organizationId, pipelineId, runId)}/costs`,
      params
    ),
  pipelineRunLogs: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    runId: RunId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineRun(organizationId, pipelineId, runId)}/logs`,
      params
    ),
  pipelineInterface: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipeline(organizationId, pipelineId)}/interface`,
      params
    ),
  pipelineClientSDK: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineInterface(organizationId, pipelineId)}/client-sdk`,
      params
    ),
  pipelineWebsiteChatbot: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineInterface(organizationId, pipelineId)}/website-chatbot`,
      params
    ),
  pipelineOpenAIApi: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineInterface(organizationId, pipelineId)}/openai-api`,
      params
    ),
  pipelineHTTPApi: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineInterface(organizationId, pipelineId)}/http-api`,
      params
    ),
  pipelineSettings: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipeline(organizationId, pipelineId)}/settings`,
      params
    ),
  pipelineSettingsConfiguration: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `${routes.pipelineSettings(organizationId, pipelineId)}/configuration`,
      params
    ),
  pipelinesNew: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines/new`,
  knowledgeBase: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/knowledge-base`,
  knowledgeBaseNew: (organizationId: OrganizationId) =>
    `${routes.knowledgeBase(organizationId)}/new`,

  knowledgeBaseEdit: (organizationId: OrganizationId, collectionName: string) =>
    `${routes.knowledgeBase(organizationId)}/${encodeURIComponent(
      collectionName
    )}/edit`,
  collectionInterface: (
    organizationId: OrganizationId,
    collectionName: string
  ) =>
    `${routes.knowledgeBase(organizationId)}/${encodeURIComponent(
      collectionName
    )}/interface`,
  collectionOverview: (
    organizationId: OrganizationId,
    collectionName: string,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(`${routes.knowledgeBase(organizationId)}/${encodeURIComponent(
      collectionName
    )}/overview`, params),
  collectionSearch: (organizationId: OrganizationId, collectionName: string) =>
    `${routes.collectionFiles(organizationId, collectionName)}/search`,
  collectionInterfaceSearch: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.collectionInterface(organizationId, collectionName)}/search`,
  collectionFiles: (organizationId: OrganizationId, collectionName: string) =>
    `${routes.knowledgeBase(organizationId)}/${encodeURIComponent(
      collectionName
    )}/content`,
  collectionMemory: (
    organizationId: OrganizationId,
    collectionName: string,
    memoryId: string | number
  ) =>
    `${routes.collectionFiles(
      organizationId,
      collectionName
    )}/${encodeURIComponent(memoryId)}/chunks`,
  collectionFilesNew: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.collectionFiles(organizationId, collectionName)}/new`,
  secrets: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/secrets`,
  secretsNew: (organizationId: OrganizationId) =>
    `${routes.secrets(organizationId)}/new`,
  chatPreview: (
    organizationId: OrganizationId,
    pipelineId: PipelineId,
    params: RouteParam = {}
  ) =>
    buildUrlWithParams(
      `/webchats${routes.pipeline(organizationId, pipelineId)}`,
      params
    ),
};

type OrganizationId = string | number;
type PipelineId = string | number;
type RunId = string | number;
