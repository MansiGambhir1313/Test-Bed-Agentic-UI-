import type { Message } from '../../types';
import { getMessageText } from '../../types';
import { ToolActivityGroup, matchToolCallsWithResults } from './ToolActivityGroup';
import { Icon } from '../ui/Icon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Safely extract string content (defensive programming)
function safeContent(content: unknown): string {
  if (typeof content === 'string') return content;
  // Fallback: use getMessageText for any non-string content
  console.log('[DEBUG] safeContent received non-string:', content);
  const result = getMessageText(content);
  console.log('[DEBUG] safeContent returning:', result, typeof result);
  return result;
}

interface MessageBubbleProps {
  message: Message;
  allMessages?: Message[];
  messageIndex?: number;
}

function UserBubble({ content }: { content: unknown }): JSX.Element {
  const text = safeContent(content);
  return (
    <div className="flex justify-end animate-widget-in">
      <div className="
        relative
        bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70
        backdrop-blur-2xl
        text-white
        px-5 py-3.5
        rounded-[20px]
        shadow-[0_8px_32px_-8px_rgba(139,92,246,0.35)]
        max-w-[70%]
        text-sm
        leading-relaxed
        tracking-normal
        font-medium
        whitespace-pre-wrap
        transition-all duration-300
        hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.45)]
        hover:-translate-y-0.5
        before:absolute before:inset-0 before:rounded-[20px] before:border before:border-white/20 before:pointer-events-none
      ">
        {text}
      </div>
    </div>
  );
}

function AIBubble({ content, timestamp }: { content: unknown; timestamp?: string }): JSX.Element {
  const text = safeContent(content);
  return (
    <div className="flex gap-4 animate-widget-in group">
      {/* Refined Avatar - Floating orb design */}
      <div className="
        relative
        w-10 h-10
        rounded-2xl
        bg-gradient-to-br from-violet-500/30 via-purple-600/25 to-fuchsia-600/20
        shrink-0
        flex items-center justify-center
        transition-all duration-500
        group-hover:scale-105
        before:absolute before:inset-0 before:rounded-2xl before:border before:border-violet-400/30 before:transition-all before:duration-500
        group-hover:before:border-violet-400/50
        after:absolute after:inset-[-2px] after:rounded-2xl after:bg-gradient-to-br after:from-violet-500/10 after:to-transparent after:blur-sm after:-z-10
      ">
        <Icon name="Cpu" size={18} className="text-violet-300 group-hover:text-violet-200 transition-colors duration-300 relative z-10" />
      </div>

      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className="
          relative
          bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]
          backdrop-blur-xl
          text-gray-100
          px-5 py-4
          rounded-[20px]
          text-sm
          leading-relaxed
          transition-all duration-300
          prose prose-invert prose-sm max-w-none
          prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-3
          prose-code:text-cyan-300 prose-a:text-blue-400 prose-strong:text-white
          prose-headings:font-display prose-headings:text-white
          shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]
          before:absolute before:inset-0 before:rounded-[20px] before:border before:border-white/10 before:pointer-events-none
          font-sans
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-cyan-500/15 px-1.5 py-0.5 rounded-lg text-cyan-300 text-xs font-mono border border-cyan-400/20" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto my-3 border border-white/5">
                    <code className={`${className} font-mono text-gray-200`} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="my-0.5 text-gray-200">{children}</li>,
              p: ({ children }) => <p className="my-2 text-gray-100">{children}</p>,
              h1: ({ children }) => <h1 className="text-xl font-display font-bold my-4 text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-display font-bold my-3 text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-display font-semibold my-2 text-white">{children}</h3>,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
        {timestamp && (
          <span className="text-[10px] text-gray-500 ml-1 font-medium tracking-wider uppercase">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

export function MessageBubble({ message, allMessages = [], messageIndex = 0 }: MessageBubbleProps): JSX.Element {
  // 1. Tool result messages - now hidden since they're integrated into ToolActivityGroup
  if (message.role === 'tool') {
    // Return empty fragment - results are shown inline with their tool calls
    return <></>;
  }

  // 2. User messages
  if (message.role === 'user') {
    return <UserBubble content={message.content} />;
  }

  // 3. AI messages with tool calls - use new unified ToolActivityGroup
  if (message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0) {
    // Match tool calls with their results from the message stream
    const activities = matchToolCallsWithResults(allMessages, messageIndex);

    return (
      <div className="flex flex-col gap-1">
        {/* Show text content if present */}
        {message.content && (
          <AIBubble content={message.content} timestamp={message.timestamp} />
        )}

        {/* Show tool activities with integrated results */}
        <ToolActivityGroup activities={activities} />
      </div>
    );
  }

  // 4. Regular AI messages
  return <AIBubble content={message.content} timestamp={message.timestamp} />;
}
