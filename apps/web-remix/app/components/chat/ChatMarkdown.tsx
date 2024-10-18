import type { AnchorHTMLAttributes } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Options } from 'react-markdown';
import Markdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';
import mermaid from 'mermaid';
import rehypeRaw from 'rehype-raw';
import { z } from 'zod';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { cn } from '~/utils/cn';

interface ChatMarkdownProps {
  [key: string]: any;
  children: string;
  options?: Options;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({
  children,
  options,
  ...rest
}) => {
  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      {...options}
      components={{
        style: Span,
        script: Span,
        p: Paragraph,
        span: Span,
        pre: Pre,
        code: Code,
        div: Div,
        h6: H6,
        h5: H5,
        h4: H4,
        h3: H3,
        h2: H2,
        h1: H1,
        li: Li,
        a: Link,
        img: Image,
        strong: Strong,
        ...options?.components,
      }}
      {...rest}
    >
      {mergeAdjacentDetailsWithSameSummary(children)}
    </Markdown>
  );
};

const DETAILS_PATTERN =
  /<details>\s*<summary>(.*?)<\/summary>\s*([\s\S]*?)<\/details>/g;

export function mergeAdjacentDetailsWithSameSummary(markdown: string): string {
  let result = '';
  let lastIndex = 0;
  const contentMap = new Map<string, string[]>();

  markdown.replace(
    DETAILS_PATTERN,
    (match: string, summary: string, content: string, offset: number) => {
      if (hasTextBetween(markdown, lastIndex, offset)) {
        result += createDetailsElementsFromMap(contentMap);
        contentMap.clear();
      }

      result += markdown.slice(lastIndex, offset);
      lastIndex = offset + match.length;

      summary = summary.trim();
      content = content.trim();

      if (contentMap.has(summary)) {
        contentMap.set(summary, [...contentMap.get(summary)!, content]);
      } else {
        contentMap.set(summary, [content]);
      }

      return '';
    },
  );

  if (contentMap.size > 0) {
    result += createDetailsElementsFromMap(contentMap);
    contentMap.clear();
  }

  result += markdown.slice(lastIndex);

  return result;
}

function createDetailsElementsFromMap(map: Map<string, string[]>) {
  return [...map.keys()]
    .map((summary) => {
      return createDetailsElement(summary, map.get(summary));
    })
    .join('');
}

function createDetailsElement(summary: string, contents: string[] = []) {
  return `<details class="text-sm border border-input rounded-md w-fit py-2 my-2">
<summary class="cursor-pointer list-none -ml-1 px-4">${summary}</summary>
${createMergedContent(contents)}
</details>`;
}

function createMergedContent(contents: string[]) {
  return `<ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5">${contents.map(createListItem).join('')}</ul>`;
}

function createListItem(content: string) {
  return `<li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">${content}</span></li>`;
}

function hasTextBetween(markdown: string, lastIndex: number, offset: number) {
  return (
    lastIndex !== offset && markdown.slice(lastIndex, offset).trim().length > 0
  );
}
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
      className={cn('!m-0 marker:text-muted-foreground text-sm', className)}
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

const MAX_VISIBLE_LENGTH = 1000;

function Pre({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLPreElement>) {
  const { copy, isCopied } = useCopyToClipboard(getStringContent(children));

  useEffect(() => {
    mermaid.initialize({});
  }, []);

  const truncatedChildren = useMemo(() => {
    return truncateChildrenContent(children, MAX_VISIBLE_LENGTH);
  }, [children]);

  const language = useMemo(() => {
    if (children && typeof children === 'object' && 'props' in children) {
      return getLanguage(children.props.className);
    }

    return null;
  }, [children]);

  return (
    <div>
      <div className="w-full bg-[#38383b] rounded-tl-[0.375rem] rounded-tr-[0.375rem] relative -bottom-1 px-2 py-1 flex justify-between min-h-[30px] items-center">
        <span className="text-muted text-xs">{language ?? ''}</span>
        <button
          className={cn('text-xs flex gap-1 items-center', {
            'text-green-500': isCopied,
            'text-white': !isCopied,
          })}
          onClick={copy}
        >
          {isCopied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span className="text-muted">Copy code</span>
        </button>
      </div>

      <pre
        className={cn(
          'my-0 bg-primary text-primary-foreground break-words whitespace-pre-wrap p-2 rounded-tl-0 rounded-tr-0',
          className,
        )}
        {...rest}
      >
        {truncatedChildren}
      </pre>
    </div>
  );
}

const MessageAttachments = z.array(
  z.object({ id: z.union([z.number(), z.string()]), file_name: z.string() }),
);

function Code({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLElement>) {
  const codeRef = useRef<HTMLElement>(null);
  const isMermaidCode = className?.includes('language-mermaid');

  if (isMermaidCode) {
    mermaid.initialize({
      theme: 'default',
    });
    mermaid.run({
      nodes: [codeRef.current!],
    });
  }

  if (className?.includes('language-buildel_message_attachments')) {
    try {
      const attachments = MessageAttachments.parse(
        JSON.parse((children || '').toString()),
      );
      return (
        <>
          {attachments.map((attachment) => {
            return <div key={attachment.id}>{attachment.file_name}</div>;
          })}
        </>
      );
    } catch (e) {
      console.error(e);
    }
    return <>Uploaded files</>;
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

function truncateChildrenContent(
  children: React.ReactNode,
  maxLength: number = 300,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return truncateString(child, maxLength);
    }

    if (child && typeof child === 'object') {
      if ('props' in child && shouldBeTruncated(child)) {
        return {
          ...child,
          props: {
            ...child.props,
            children: truncateChildrenContent(child.props.children, maxLength),
          },
        };
      }
    }
    return child;
  });
}

function getStringContent(children: React.ReactNode): string {
  return (
    React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return child;
      }

      if (child && typeof child === 'object') {
        if ('props' in child && shouldBeTruncated(child)) {
          return getStringContent(child.props.children);
        }
      }
      return '';
    })?.join('\n') ?? ''
  );
}

function shouldBeTruncated(child: { props: Record<string, unknown> }) {
  if ('className' in child.props && typeof child.props.className === 'string') {
    const language = getLanguage(child.props.className);

    if (!language) return false;

    return [
      'json',
      'javascript',
      'typescript',
      'html',
      'css',
      'sql',
      'python',
      'java',
      'csharp',
      'c',
      'cpp',
      'bash',
      'sh',
      'yaml',
      'xml',
    ].includes(language);
  }

  return false;
}

function getLanguage(className?: string) {
  return className?.match(/language-(\w+)/)?.[1];
}

function truncateString(str: string, maxLength: number) {
  return str.length > maxLength
    ? `${str.slice(0, maxLength / 1.5)}\n\n... rest of code`
    : str;
}
