"use client";

import {useState, type HTMLAttributes} from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Copy, Check} from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

const slugId = (text: string) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const MarkdownRenderer = ({content, isDarkMode = false}: MarkdownRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* ── Headings ──────────────────────────────────── */
          h1: ({children}) => (
            <h1
              id={slugId(String(children))}
              className="font-display text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold
                       text-foreground mt-10 mb-4 first:mt-0 scroll-mt-24 leading-tight break-words"
            >
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2
              id={slugId(String(children))}
              className="font-display text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold
                       text-foreground mt-8 mb-3 pb-2 border-b border-border scroll-mt-24 break-words"
            >
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3
              id={slugId(String(children))}
              className="font-display text-base sm:text-lg md:text-xl xl:text-2xl font-semibold
                       text-foreground mt-6 mb-2 scroll-mt-24 break-words"
            >
              {children}
            </h3>
          ),
          h4: ({children}) => (
            <h4
              id={slugId(String(children))}
              className="font-display text-sm sm:text-base md:text-lg font-semibold
                       text-foreground mt-5 mb-2 scroll-mt-24 break-words"
            >
              {children}
            </h4>
          ),

          /* ── Body text ─────────────────────────────────── */
          p: ({children}) => (
            <p className="text-sm sm:text-[15px] xl:text-base text-muted-foreground leading-[1.75] sm:leading-[1.8] mb-4 break-words [overflow-wrap:anywhere]">
              {children}
            </p>
          ),
          ul: ({children}) => (
            <ul
              className="list-disc list-outside ml-5 sm:ml-5 space-y-1.5 mb-4
                         text-sm sm:text-[15px] xl:text-base text-muted-foreground leading-[1.8]"
            >
              {children}
            </ul>
          ),
          ol: ({children}) => (
            <ol
              className="list-decimal list-outside ml-5 sm:ml-5 space-y-1.5 mb-4
                         text-sm sm:text-[15px] xl:text-base text-muted-foreground leading-[1.8]"
            >
              {children}
            </ol>
          ),
          li: ({children}) => (
            <li className="pl-1 break-words [overflow-wrap:anywhere]">{children}</li>
          ),

          blockquote: ({children}) => (
            <blockquote
              className="border-l-[3px] border-github-blue pl-3 sm:pl-4 py-1 my-5
                       text-muted-foreground italic text-sm sm:text-[15px] xl:text-base
                       bg-github-blue/5 dark:bg-github-blue/10 rounded-r-lg"
            >
              {children}
            </blockquote>
          ),

          a: ({href, children}) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-github-blue hover:underline underline-offset-2
                       font-medium break-words [overflow-wrap:anywhere]"
            >
              {children}
            </a>
          ),

          /* ── Images ────────────────────────────────────── */
          img: ({src, alt}) => {
            if (typeof src !== "string") {
              return null;
            }

            return (
              <figure className="my-6 sm:my-8 max-w-full overflow-hidden">
                <Image
                  src={src}
                  alt={alt ?? ""}
                  width={100}
                  height={100}
                  className="rounded-xl shadow-md w-full max-w-full h-auto
                           border border-border object-contain"
                />
                {alt && (
                  <figcaption className="text-center text-xs text-muted-foreground mt-2 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          /* ── Tables ────────────────────────────────────── */
          table: ({children}) => (
            <div className="my-6 max-w-full overflow-x-auto [scrollbar-width:thin]">
              <div className="min-w-full inline-block align-middle">
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="min-w-full text-sm xl:text-base divide-y divide-border">
                    {children}
                  </table>
                </div>
              </div>
            </div>
          ),
          thead: ({children}) => <thead className="bg-muted/50">{children}</thead>,
          th: ({children}) => (
            <th
              className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold
                         uppercase tracking-wider text-foreground whitespace-nowrap"
            >
              {children}
            </th>
          ),
          td: ({children}) => (
            <td
              className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm xl:text-base text-muted-foreground
                         border-t border-border/50 break-words [overflow-wrap:anywhere]"
            >
              {children}
            </td>
          ),

          /* ── Code ──────────────────────────────────────── */
          code({className, children, ...props}: HTMLAttributes<HTMLElement>) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isBlock = match || codeString.includes("\n");

            /* Fenced block with language tag */
            if (match) {
              return (
                <div
                  className="my-5 sm:my-6 max-w-full overflow-hidden rounded-xl
                             border border-gray-200 dark:border-gray-700"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-3 sm:px-4 py-2
                             bg-gray-100 dark:bg-gray-900 border-b border-gray-200
                             dark:border-gray-700"
                  >
                    <span
                      className="text-[10px] sm:text-[11px] font-mono
                                   text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {match[1]}
                    </span>
                    <button
                      onClick={() => copy(codeString)}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px]
                               text-gray-500 dark:text-gray-400 hover:text-gray-800
                               dark:hover:text-gray-200 transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check size={10} className="text-green-500" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scroll long lines inside the panel without widening the page. */}
                  <div className="max-w-full overflow-x-auto">
                    <SyntaxHighlighter
                      style={isDarkMode ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: "clamp(0.8125rem, 0.75rem + 0.2vw, 0.9375rem)",
                        lineHeight: "1.6",
                        minWidth: "max-content",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                      codeTagProps={{style: {whiteSpace: "pre", fontFamily: "var(--font-mono)"}}}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }

            /* Unfenced block (no language) */
            if (isBlock) {
              return (
                <div
                  className="my-5 sm:my-6 max-w-full overflow-x-auto rounded-xl
                             border border-border"
                >
                  <pre
                    className="px-4 py-4 text-xs sm:text-[0.8125rem] xl:text-[0.9375rem] font-mono
                             text-foreground bg-muted/50 min-w-full whitespace-pre
                             leading-relaxed"
                  >
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }

            /* Inline code */
            return (
              <code
                className="bg-muted px-1 sm:px-1.5 py-0.5 rounded text-[0.75rem] sm:text-[0.8125rem]
                         font-mono text-github-blue dark:text-blue-400
                         border border-border/50 break-all"
                {...props}
              >
                {children}
              </code>
            );
          },

          /* ── Misc ──────────────────────────────────────── */
          hr: () => <hr className="my-8 sm:my-10 border-border" />,
          strong: ({children}) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({children}) => <em className="italic text-muted-foreground">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
