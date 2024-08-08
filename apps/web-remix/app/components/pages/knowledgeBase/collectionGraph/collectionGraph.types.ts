import type { Node } from '@xyflow/react';
import type { z } from 'zod';

import type { MemoryNodeDetails } from '~/api/knowledgeBase/knowledgeApi.contracts';
import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';

export type IEmbeddingNode = Node<IMemoryNode & { base_color: string }>;

export type IMemoryNodeDetails = z.TypeOf<typeof MemoryNodeDetails>;
