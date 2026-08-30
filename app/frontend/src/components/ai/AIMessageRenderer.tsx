import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface AIMessageRendererProps {
  content: string;
}

export default function AIMessageRenderer({ content }: AIMessageRendererProps) {
  // Simple parser to render markdown chunks cleanly without external heavy dependencies
  const renderFormatted = (text: string) => {
    // Split by code blocks first
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyCounter = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(renderTextSections(precedingText, `text-${keyCounter++}`));
      }

      const language = match[1] || 'bash';
      const code = match[2].trim();
      parts.push(
        <CodeBlock key={`code-${keyCounter++}`} code={code} language={language} />
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(renderTextSections(remainingText, `text-${keyCounter++}`));
    }

    return parts;
  };

  const renderTextSections = (section: string, baseKey: string) => {
    const lines = section.split('\n');
    return (
      <div key={baseKey} className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs font-bold text-sky-300 mt-2 mb-1 flex items-center gap-1.5">
                {parseInline(trimmed.replace('### ', ''))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-sky-200 mt-2 mb-1">
                {parseInline(trimmed.replace('## ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-sm font-bold text-white mt-2 mb-1">
                {parseInline(trimmed.replace('# ', ''))}
              </h2>
            );
          }

          // Blockquote / Alert
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="border-l-2 border-sky-500/60 bg-sky-950/30 pl-2.5 py-1 text-[11px] text-sky-200/90 rounded-r my-1">
                {parseInline(trimmed.replace('> ', ''))}
              </div>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-[11.5px] leading-relaxed text-slate-200">
                <span className="text-sky-400 font-bold mt-0.5">•</span>
                <span className="flex-1">{parseInline(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-[11.5px] leading-relaxed text-slate-200">
                <span className="text-purple-400 font-semibold text-[10px] mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1">{parseInline(numMatch[2])}</span>
              </div>
            );
          }

          // Normal paragraph
          return (
            <p key={idx} className="text-[11.5px] leading-relaxed text-slate-200">
              {parseInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const parseInline = (text: string): React.ReactNode => {
    // Parse bold **text** and inline `code`
    const tokens: React.ReactNode[] = [];
    const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let i = 0;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        tokens.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        tokens.push(
          <strong key={i++} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        tokens.push(
          <code
            key={i++}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 text-sky-300 font-mono text-[10.5px] border border-slate-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = match.index + token.length;
    }

    if (lastIdx < text.length) {
      tokens.push(text.substring(lastIdx));
    }

    return tokens.length > 0 ? tokens : text;
  };

  return <div className="ai-message-content space-y-1">{renderFormatted(content)}</div>;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-md overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px]">
      <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Terminal className="h-3 w-3 text-sky-400" />
          {language || 'bash'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-2.5 overflow-x-auto text-sky-200 text-[11px] leading-relaxed selection:bg-sky-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}
