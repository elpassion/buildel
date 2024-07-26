import React from 'react';

import { CommentEditor } from './CommentEditor';
import type { CommentNodeProps } from './CommentNode';
import { CommentNode } from './CommentNode';

export function ReadonlyCommentNode({ data, ...props }: CommentNodeProps) {
  return (
    <CommentNode data={data} color={data.opts['color']} {...props}>
      <CommentEditor content={data.opts['content']} disabled={true} />
    </CommentNode>
  );
}
