import type { Node } from '@xyflow/react';

import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';

export type IEmbeddingNode = Node<IMemoryNode & { base_color: string }>;
