import React, { AnchorHTMLAttributes } from "react";
import Markdown, { MarkdownToJSX } from "markdown-to-jsx";
import classNames from "classnames";
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
          ul: {
            component: Ul,
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
        },
        ...options,
      }}
      {...rest}
    >
      {children}
    </Markdown>
  );
};

function Paragraph({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={classNames(
        "prose break-words whitespace-pre-wrap text-xs text-white",
        className
      )}
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-xs text-neutral-100",
        className
      )}
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
    <div
      className={classNames(
        "prose break-words whitespace-pre-wrap text-xs text-neutral-100",
        className
      )}
      {...rest}
    >
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-xs text-neutral-100 font-bold",
        className
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-sm text-neutral-100 font-bold",
        className
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-base text-neutral-100 font-bold",
        className
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-lg text-neutral-100 font-bold",
        className
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-xl text-neutral-100 font-bold",
        className
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
      className={classNames(
        "prose break-words whitespace-pre-wrap text-2xl text-neutral-100 font-bold",
        className
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

function Ul({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={classNames("prose text-neutral-100", className)} {...rest}>
      {children}
    </ul>
  );
}

function Li({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={classNames("prose text-neutral-100 text-sm !m-0", className)}
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
      className={classNames("prose text-primary-500 text-xs", className)}
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
  return (
    <pre
      className={classNames(
        "my-1 bg-neutral-900 prose break-words whitespace-pre-wrap text-white text-xs",
        className
      )}
      {...rest}
    >
      <code>{children}</code>
    </pre>
  );
}

function Code({
  children,
  className,
  ...rest
}: React.ParamHTMLAttributes<HTMLPreElement>) {
  return (
    <code
      className={classNames(
        "my-1 bg-neutral-900 prose break-words whitespace-pre-wrap text-white text-xs",
        className
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
  return <img alt={alt} className={classNames(className)} {...rest} />;
}
