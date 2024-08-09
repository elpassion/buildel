import type { z } from 'zod';

import type { MemoryNodeDetails } from '~/api/knowledgeBase/knowledgeApi.contracts';

export type IMemoryNodeDetails = z.TypeOf<typeof MemoryNodeDetails>;

export type IPrevNextNode = string | number | null | undefined;
