import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Copy, Check} from "lucide-react";
import {useState} from "react";
import {Button} from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

const MarkdownRenderer = ({content, isDarkMode = false}: MarkdownRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get the syntax highlighting style based on theme preference
  const getStyle = () => {
    return isDarkMode ? oneDark : oneLight;
  };

  // Generate heading ID for TOC navigation
  const generateId = (text: string) => {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({children}) => (
          <h1
            id={generateId(String(children))}
            className="text-3xl md:text-4xl font-bold text-github-gray dark:text-white mt-8 mb-4 first:mt-0 scroll-mt-24"
          >
            {children}
          </h1>
        ),
        h2: ({children}) => (
          <h2
            id={generateId(String(children))}
            className="text-2xl md:text-3xl font-bold text-github-gray dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 scroll-mt-24"
          >
            {children}
          </h2>
        ),
        h3: ({children}) => (
          <h3
            id={generateId(String(children))}
            className="text-xl md:text-2xl font-semibold text-github-gray dark:text-white mt-6 mb-3 scroll-mt-24"
          >
            {children}
          </h3>
        ),
        h4: ({children}) => (
          <h4
            id={generateId(String(children))}
            className="text-lg md:text-xl font-semibold text-github-gray dark:text-white mt-4 mb-2 scroll-mt-24"
          >
            {children}
          </h4>
        ),
        p: ({children}) => (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>
        ),
        ul: ({children}) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-4">
            {children}
          </ul>
        ),
        ol: ({children}) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-4">
            {children}
          </ol>
        ),
        li: ({children}) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({children}) => (
          <blockquote className="border-l-4 border-github-blue pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
            {children}
          </blockquote>
        ),
        a: ({href, children}) => (
          <a
            href={href}
            className="text-github-blue hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        img: ({src, alt}) => (
          <figure className="my-6">
            <img src={src} alt={alt} className="rounded-lg shadow-lg max-w-full h-auto mx-auto" />
            {alt && (
              <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        table: ({children}) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({children}) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
        th: ({children}) => (
          <th className="px-4 py-3 text-left text-sm font-semibold text-github-gray dark:text-white border-b border-gray-200 dark:border-gray-700">
            {children}
          </th>
        ),
        td: ({children}) => (
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {children}
          </td>
        ),
        code: ({className, children, ...props}: {className?: string; [key: string]: any}) => {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          if (match) {
            return (
              <div className="relative group my-4">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 text-white"
                    onClick={() => copyToClipboard(codeString)}
                  >
                    {copiedCode === codeString ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="absolute top-2 left-3 text-xs text-gray-400 font-mono">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  style={getStyle()}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg !pt-8 !mt-0"
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-github-blue dark:text-blue-400"
              {...props}
            >
              {children}
            </code>
          );
        },
        hr: () => <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />,
        strong: ({children}: React.HTMLAttributes<HTMLHeadingElement>) => (
          <strong className="font-bold text-github-gray dark:text-white">{children}</strong>
        ),
        em: ({children}: React.HTMLAttributes<HTMLHeadingElement>) => (
          <em className="italic text-gray-600 dark:text-gray-400">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
