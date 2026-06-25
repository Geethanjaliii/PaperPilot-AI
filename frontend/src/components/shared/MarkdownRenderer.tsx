"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Custom renderer or preprocessing to render citation numbers [1] as custom styled badges
  const formattedContent = content.replace(
    /\[([0-9]+)\]/g,
    `<span class="inline-flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold bg-primary-accent text-white rounded-full cursor-pointer select-none align-middle hover:scale-105 active:scale-95 transition-transform shadow-sm shadow-primary-accent/40">$1</span>`
  );

  return (
    <div className="prose prose-invert max-w-none text-text-primary text-sm md:text-base leading-relaxed space-y-4">
      {/* If we preprocessed HTML styling tags, we can use dangerouslySetInnerHTML, or just render standard Markdown since react-markdown handles standard markdown. 
          To support the citation badges, let's parse them in a custom component renderer or render the markdown directly. 
          Let's render standard markdown with react-markdown, and customize how standard elements look!
      */}
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl md:text-2xl font-extrabold text-text-primary mt-6 mb-3 border-b border-border-color pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg md:text-xl font-bold text-primary-accent mt-5 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-accent rounded-full"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base md:text-lg font-bold text-text-primary mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            // If the paragraph is a single line citation or list, render it cleanly
            return <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-4">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 mb-4 text-xs md:text-sm text-text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-xs md:text-sm text-text-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-accent bg-card-bg/60 rounded-r-xl p-3 my-4 italic text-text-secondary text-xs md:text-sm">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-xs text-secondary-accent font-mono">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
