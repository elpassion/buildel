import { z } from 'zod';

import { KnowledgeBaseCollectionCost } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { PipelineCost } from '~/api/pipeline/pipeline.contracts';
import { PaginationMeta } from '~/components/pagination/pagination.types';

export const Organization = z.object({
  id: z.number(),
  name: z.string(),
});

export type IOrganization = z.TypeOf<typeof Organization>;

export const OrganizationsResponse = z.object({
  data: z.array(Organization),
});

export const OrganizationResponse = z
  .object({
    data: Organization,
  })
  .transform((res) => res.data);

export const CreateOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2),
  }),
});

export type ICreateOrganizationSchema = z.TypeOf<
  typeof CreateOrganizationSchema
>;

export const Membership = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    email: z.string(),
  }),
});

export const Invitation = z.object({
  id: z.number(),
  email: z.string(),
  expires_at: z.string(),
});

export type IInvitation = z.TypeOf<typeof Invitation>;

export const InvitationResponse = z
  .object({
    data: Invitation,
  })
  .transform((res) => res.data);

export const InvitationsResponse = z
  .object({
    data: z.array(Invitation),
  })
  .transform((res) => res.data);

export const CreateInvitationSchema = z.object({
  invitation: z.object({ email: z.string().email() }),
});

export const MembershipsResponse = z
  .object({
    data: z.array(Membership),
  })
  .transform((res) => res.data);
export const MembershipResponse = z.object({
  data: Membership,
});

export const APIKey = z.object({
  key: z.union([z.string(), z.null()]),
});

export const APIKeyResponse = z
  .object({ data: APIKey })
  .transform((res) => res.data);

export const WorkflowTemplate = z.object({
  name: z.string(),
  template_name: z.string(),
  template_description: z.string(),
});

export type IWorkflowTemplate = z.TypeOf<typeof WorkflowTemplate>;

export const WorkflowTemplatesResponse = z
  .object({ data: z.array(WorkflowTemplate) })
  .transform((res) => res.data);

export const CreateFromTemplateSchema = z.object({
  template_name: z.string(),
});

export type ICreateFromTemplateSchema = z.TypeOf<
  typeof CreateFromTemplateSchema
>;

export const CreateFromTemplateResponse = z
  .object({
    data: z.object({ pipeline_id: z.number() }),
  })
  .transform((res) => res.data);

export type ICreateFromTemplateResponse = z.TypeOf<
  typeof CreateFromTemplateResponse
>;

const OrganizationPipelineCost = PipelineCost.extend({
  type: z.literal('pipeline'),
  pipeline_id: z.number().nullable(),
  run_id: z.number().nullable(),
});

const OrganizationCollectionCost = KnowledgeBaseCollectionCost.extend({
  type: z.literal('collection'),
  memory_collection_id: z.number().nullable(),
  memory_collection_name: z.string().nullable(),
});

const OrganizationNullableCost = PipelineCost.extend({
  type: z.literal(null),
});

type IOrganizationCollectionCost = z.TypeOf<typeof OrganizationCollectionCost>;

export const OrganizationCost = z.discriminatedUnion('type', [
  OrganizationCollectionCost,
  OrganizationPipelineCost,
  OrganizationNullableCost,
]);

export type IOrganizationCost = z.TypeOf<typeof OrganizationCost>;

export const OrganizationCostResponse = z.object({
  data: z.array(OrganizationCost),
  meta: PaginationMeta,
});

export function isOrganizationCollectionCost(
  cost: IOrganizationCost,
): cost is IOrganizationCollectionCost {
  return cost.type === 'collection';
}

export const CrawlSitemapResponse = z
  .object({ data: z.array(z.string()) })
  .transform((res) => res.data);
