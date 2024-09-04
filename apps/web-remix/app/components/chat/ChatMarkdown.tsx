import type { AnchorHTMLAttributes } from 'react';
import React, { useEffect, useRef } from 'react';
import Markdown from 'markdown-to-jsx';
import type { MarkdownToJSX } from 'markdown-to-jsx';
import mermaid from 'mermaid';
import { z } from 'zod';

import { cn } from '~/utils/cn';

interface ChatMarkdownProps {
  [key: string]: any;
  children: string;
  options?: MarkdownToJSX.Options;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({
  children,
  options,
  ...rest
}) => {
  return (
    <Markdown
      options={{
        overrides: {
          style: {
            component: Span,
          },
          script: {
            component: Span,
          },
          p: {
            component: Paragraph,
          },
          span: {
            component: Span,
          },
          pre: {
            component: Pre,
          },
          code: {
            component: Code,
          },
          div: {
            component: Div,
          },
          h6: {
            component: H6,
          },
          h5: {
            component: H5,
          },
          h4: {
            component: H4,
          },
          h3: {
            component: H3,
          },
          h2: {
            component: H2,
          },
          h1: {
            component: H1,
          },

          li: {
            component: Li,
          },
          a: {
            component: Link,
          },
          img: {
            component: Image,
          },
          strong: {
            component: Strong,
          },
        },
        ...options,
      }}
      {...rest}
    >
      {children}
    </Markdown>
  );
};

function Strong({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLDivElement>) {
  return (
    <strong className={cn('font-bold text-foreground', className)} {...rest}>
      {children}
    </strong>
  );
}

function Paragraph({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('my-2 break-words whitespace-pre-wrap text-sm', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

function Span({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-sm break-words whitespace-pre-wrap', className)}
      {...rest}
    >
      {children}
    </span>
  );
}

function Div({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('break-words whitespace-pre-wrap', className)} {...rest}>
      {children}
    </div>
  );
}

function H6({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6
      className={cn(
        'break-words whitespace-pre-wrap text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h6>
  );
}
function H5({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn(
        'break-words whitespace-pre-wrap text-sm text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h5>
  );
}

function H4({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        'break-words whitespace-pre-wrap text-base text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h4>
  );
}

function H3({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'break-words whitespace-pre-wrap text-lg text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h3>
  );
}

function H2({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'break-words whitespace-pre-wrap text-xl text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

function H1({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'break-words whitespace-pre-wrap text-2xl text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

function Li({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn('!m-0 marker:text-muted-foreground', className)}
      {...rest}
    >
      {children}
    </li>
  );
}

function Link({
  children,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn('text-foreground font-bold hover:underline', className)}
      target="_blank"
      rel="noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}

function Pre({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLPreElement>) {
  useEffect(() => {
    mermaid.initialize({});
  }, []);

  return (
    <pre
      className={cn(
        'my-1 bg-primary text-primary-foreground break-words whitespace-pre-wrap',
        className,
      )}
      {...rest}
    >
      <code>{children}</code>
    </pre>
  );
}

const MessageAttachments = z.array(
  z.object({ id: z.union([z.number(), z.string()]), file_name: z.string() }),
);

function Code({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLPreElement>) {
  const codeRef = useRef<HTMLElement>(null);
  const isMermaidCode = className?.includes('lang-mermaid');
  if (isMermaidCode) {
    mermaid.initialize({
      theme: 'default',
    });
    mermaid.run({
      nodes: [codeRef.current!],
    });
  }
  if (className?.includes('lang-buildel_message_attachments')) {
    try {
      const attachments = MessageAttachments.parse(
        JSON.parse((children || '').toString()),
      );
      return attachments.map((attachment) => {
        return <div key={attachment.id}>{attachment.file_name}</div>;
      });
    } catch (e) {
      console.error(e);
    }
    return 'Uploaded files';
  }
  return (
    <code
      ref={codeRef}
      className={cn(
        'my-1 bg-primary break-words whitespace-pre-wrap text-primary-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </code>
  );
}

function Image({
  alt,
  className,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className={cn(className)} {...rest} />;
}
