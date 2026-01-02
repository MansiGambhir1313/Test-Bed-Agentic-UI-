import { useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import type { ToolCall, Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Sub-agent friendly names and icons
const SUBAGENT_CONFIG: Record<string, { icon: IconName; label: string; accent: string; bg: string }> = {
  'designer': {
    icon: 'Palette',
    label: 'Designer',
    accent: 'text-pink-300',
    bg: 'bg-pink-500/20'
  },
  'image-researcher': {
    icon: 'Image',
    label: 'Image Researcher',
    accent: 'text-cyan-300',
    bg: 'bg-cyan-500/20'
  },
  'developer': {
    icon: 'Code',
    label: 'Developer',
    accent: 'text-emerald-300',
    bg: 'bg-emerald-500/20'
  },
  'researcher': {
    icon: 'Search',
    label: 'Researcher',
    accent: 'text-blue-300',
    bg: 'bg-blue-500/20'
  },
};

const DEFAULT_SUBAGENT = {
  icon: 'Bot' as IconName,
  label: 'Agent',
  accent: 'text-rose-300',
  bg: 'bg-rose-500/20'
};

function getSubAgentConfig(subagentType?: string) {
  if (!subagentType) return DEFAULT_SUBAGENT;
  return SUBAGENT_CONFIG[subagentType] || DEFAULT_SUBAGENT;
}

// Tool configuration with distinctive styling
const TOOL_STYLES: Record<string, {
  icon: IconName;
  label: string;
  accent: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  write_file: {
    icon: 'FileCode',
    label: 'Writing',
    accent: 'text-emerald-300',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-400/40',
    glow: 'shadow-emerald-500/25'
  },
  edit_file: {
    icon: 'Edit3',
    label: 'Editing',
    accent: 'text-amber-300',
    bg: 'bg-amber-500/20',
    border: 'border-amber-400/40',
    glow: 'shadow-amber-500/25'
  },
  read_file: {
    icon: 'Eye',
    label: 'Reading',
    accent: 'text-sky-300',
    bg: 'bg-sky-500/20',
    border: 'border-sky-400/40',
    glow: 'shadow-sky-500/25'
  },
  write_todos: {
    icon: 'ListTodo',
    label: 'Tasks',
    accent: 'text-violet-300',
    bg: 'bg-violet-500/20',
    border: 'border-violet-400/40',
    glow: 'shadow-violet-500/25'
  },
  task: {
    icon: 'Cpu',
    label: 'Sub-Agent',
    accent: 'text-rose-300',
    bg: 'bg-rose-500/20',
    border: 'border-rose-400/40',
    glow: 'shadow-rose-500/25'
  },
  web_search: {
    icon: 'Search',
    label: 'Searching',
    accent: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-400/40',
    glow: 'shadow-cyan-500/25'
  },
  fetch_url: {
    icon: 'Globe',
    label: 'Fetching',
    accent: 'text-teal-300',
    bg: 'bg-teal-500/20',
    border: 'border-teal-400/40',
    glow: 'shadow-teal-500/25'
  },
  ls: {
    icon: 'FolderTree',
    label: 'Listing',
    accent: 'text-orange-300',
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/40',
    glow: 'shadow-orange-500/25'
  },
  glob: {
    icon: 'FileSearch',
    label: 'Finding',
    accent: 'text-indigo-300',
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-400/40',
    glow: 'shadow-indigo-500/25'
  },
  grep: {
    icon: 'TextSearch',
    label: 'Searching',
    accent: 'text-purple-300',
    bg: 'bg-purple-500/20',
    border: 'border-purple-400/40',
    glow: 'shadow-purple-500/25'
  },
};

const DEFAULT_STYLE = {
  icon: 'Zap' as IconName,
  label: 'Running',
  accent: 'text-blue-300',
  bg: 'bg-blue-500/20',
  border: 'border-blue-400/40',
  glow: 'shadow-blue-500/25'
};

function getToolStyle(name: string) {
  return TOOL_STYLES[name] || DEFAULT_STYLE;
}

// Get file extension icon
function getFileIcon(filePath: string): IconName {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, IconName> = {
    tsx: 'FileCode2',
    ts: 'FileCode2',
    jsx: 'FileCode',
    js: 'FileCode',
    json: 'FileJson',
    css: 'Palette',
    scss: 'Palette',
    md: 'FileText',
    py: 'FileCode',
    html: 'FileCode',
  };
  return iconMap[ext || ''] || 'File';
}

// Parse todo statuses
function parseTodoStats(todos: unknown[]): { pending: number; running: number; done: number } {
  const stats = { pending: 0, running: 0, done: 0 };
  for (const todo of todos) {
    if (typeof todo === 'object' && todo !== null && 'status' in todo) {
      const status = (todo as { status: string }).status;
      if (status === 'pending') stats.pending++;
      else if (status === 'in_progress') stats.running++;
      else if (status === 'completed') stats.done++;
    }
  }
  return stats;
}

// Markdown components for Sub-Agent results
const markdownComponents = {
  code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-rose-950/50 px-1.5 py-0.5 rounded-md text-rose-300 text-xs font-mono border border-rose-500/20" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto my-2 border border-rose-500/10">
        <code className={`${className} font-mono text-xs`} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors">
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside my-2 space-y-1 ml-2">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside my-2 space-y-1 ml-2">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-gray-200 text-sm">{children}</li>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="my-2 text-gray-200 text-sm leading-relaxed">{children}</p>,
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold my-3 text-white border-b border-rose-500/20 pb-1">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold my-2.5 text-white">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-semibold my-2 text-gray-100">{children}</h3>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-rose-200">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-gray-300">{children}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-rose-500/50 pl-3 my-2 text-gray-300 italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-rose-500/20" />,
};

export interface ToolActivity {
  toolCall: ToolCall;
  result?: string;
  status: 'pending' | 'running' | 'success' | 'error';
}

interface ToolActivityItemProps {
  activity: ToolActivity;
  isLast: boolean;
}

function ToolActivityItem({ activity, isLast }: ToolActivityItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toolCall, result, status } = activity;
  const style = getToolStyle(toolCall.name);

  // Extract meaningful info based on tool type
  const filePath = toolCall.args.file_path as string || toolCall.args.path as string || '';
  const fileName = filePath.split('/').pop() || '';
  const fileDir = filePath.replace(fileName, '').replace(/\/$/, '') || '/';

  const isWriteFile = toolCall.name === 'write_file';
  const isEditFile = toolCall.name === 'edit_file';
  const isWriteTodos = toolCall.name === 'write_todos';
  const isTask = toolCall.name === 'task';

  // Get sub-agent config if this is a task
  const subagentType = isTask && typeof toolCall.args.subagent_type === 'string'
    ? toolCall.args.subagent_type
    : undefined;
  const subagentConfig = isTask ? getSubAgentConfig(subagentType) : null;
  const taskDescription = isTask && typeof toolCall.args.description === 'string'
    ? toolCall.args.description
    : '';

  // Determine if there's meaningful content to expand
  const hasExpandableContent = result || Object.keys(toolCall.args).length > 0;

  // Minimal status indicator - just a dot
  const StatusDot = () => {
    if (status === 'running') {
      return <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>;
    }
    if (status === 'error') {
      return <span className="h-2 w-2 rounded-full bg-red-500" />;
    }
    if (status === 'success') {
      return <span className="h-2 w-2 rounded-full bg-emerald-500" />;
    }
    return <span className="h-2 w-2 rounded-full bg-gray-500/50" />;
  };

  return (
    <div
      className={`
        group relative
        bg-white/[0.03]
        rounded-2xl
        overflow-hidden
        transition-all duration-300
        hover:bg-white/[0.05]
        ${status === 'running' ? 'ring-1 ring-blue-500/20' : ''}
        ${!isLast ? 'mb-2.5' : ''}
      `}
    >
      {/* Header row - cleaner, more minimal */}
      <div
        className={`
          flex items-center gap-3 px-4 py-3
          ${hasExpandableContent ? 'cursor-pointer' : ''}
          transition-colors duration-200
        `}
        onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
      >
        {/* Status dot - minimal */}
        <StatusDot />

        {/* Tool icon with subtle background */}
        <div className={`p-2 rounded-xl ${isTask && subagentConfig ? subagentConfig.bg : style.bg} transition-all duration-300 group-hover:scale-105`}>
          <Icon
            name={isWriteFile || isEditFile ? getFileIcon(filePath) : isTask && subagentConfig ? subagentConfig.icon : style.icon}
            size={14}
            className={isTask && subagentConfig ? subagentConfig.accent : style.accent}
          />
        </div>

        {/* Content based on tool type */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {(isWriteFile || isEditFile) && fileName ? (
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-[13px] font-semibold text-white truncate">{fileName}</span>
              <span className="text-[11px] text-gray-500 truncate hidden sm:inline font-mono">{fileDir}</span>
            </div>
          ) : isWriteTodos && Array.isArray(toolCall.args.todos) ? (
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-gray-200">Tasks</span>
              <TodoBadges todos={toolCall.args.todos} />
            </div>
          ) : isTask && subagentConfig ? (
            (() => {
              // Get first line or first 60 chars for preview
              const firstLine = taskDescription.split('\n')[0];
              const preview = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;

              return (
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[13px] font-medium ${subagentConfig.accent}`}>
                    {subagentConfig.label}
                  </span>
                  {preview && (
                    <span className="text-[11px] text-gray-400 truncate">
                      {preview}
                    </span>
                  )}
                </div>
              );
            })()
          ) : (
            <span className="text-[13px] font-medium text-gray-200">
              {style.label}
              {typeof toolCall.args.query === 'string' && toolCall.args.query && (
                <span className="text-gray-400 ml-2 font-normal text-[12px]">
                  "{toolCall.args.query.slice(0, 35)}"
                </span>
              )}
              {typeof toolCall.args.url === 'string' && toolCall.args.url && (
                <span className="text-gray-400 ml-2 font-normal truncate font-mono text-[10px]">
                  {toolCall.args.url.slice(0, 45)}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Expand chevron - more subtle */}
        {hasExpandableContent && (
          <Icon
            name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
            size={14}
            className="text-gray-500 shrink-0 transition-all duration-300 group-hover:text-gray-400"
          />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-black/20 px-4 py-3">
          {/* Special render for write_todos - beautiful task list */}
          {isWriteTodos && Array.isArray(toolCall.args.todos) ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="CheckSquare" size={12} className="text-violet-400" />
                <span className="text-[11px] uppercase tracking-widest text-violet-400/80 font-medium">
                  Tasks ({toolCall.args.todos.length})
                </span>
              </div>
              <TodoListExpanded todos={toolCall.args.todos} />
            </div>
          ) : isTask && subagentConfig ? (
            /* Special rendering for Sub-Agent (task) - show description as markdown, then result if available */
            <div className="space-y-4">
              {/* Task description as markdown */}
              {taskDescription && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="FileText" size={12} className={subagentConfig.accent} />
                    <span className={`text-[11px] uppercase tracking-widest ${subagentConfig.accent} font-medium opacity-80`}>
                      Task
                    </span>
                  </div>
                  <div className={`p-4 bg-gradient-to-br ${subagentConfig.bg} to-black/30 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto mac-scrollbar`}>
                    <div className="prose prose-sm prose-invert max-w-none font-sans">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {taskDescription}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              {/* Result section if available */}
              {result && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="CheckCircle" size={12} className="text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400/80 font-medium">Result</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-950/20 to-black/30 rounded-xl border border-emerald-500/10 max-h-[500px] overflow-y-auto mac-scrollbar">
                    <div className="prose prose-sm prose-invert max-w-none font-sans">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {result}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ArrowRight" size={12} className="text-emerald-400" />
                <span className="text-[11px] uppercase tracking-widest text-emerald-400/80 font-medium">Result</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 max-h-[150px] overflow-y-auto mac-scrollbar">
                <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
                  {result.length > 500 ? result.slice(0, 500) + `\n... [${Math.ceil(result.length / 1024)}KB]` : result}
                </pre>
              </div>
            </div>
          ) : null}

          {/* Args section (only if no result, not todos/task, for debugging) */}
          {!result && !isWriteTodos && !isTask && Object.keys(toolCall.args).length > 0 && (
            <div className="space-y-2">
              {Object.entries(toolCall.args).map(([key, value]) => {
                const strValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
                const isLong = strValue.length > 100;

                return (
                  <div key={key} className="text-[11px]">
                    <span className="text-gray-500 font-mono">{key}:</span>
                    {isLong ? (
                      <div className="mt-1.5 p-3 bg-black/30 rounded-xl border border-white/5 max-h-[100px] overflow-y-auto mac-scrollbar">
                        <pre className="text-gray-300 font-mono whitespace-pre-wrap break-all text-[10px]">
                          {strValue.slice(0, 300)}
                          {strValue.length > 300 && <span className="text-gray-500">... [{Math.ceil(strValue.length / 1024)}KB]</span>}
                        </pre>
                      </div>
                    ) : (
                      <span className="text-gray-300 font-mono ml-1.5">{strValue}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Todo status badges
function TodoBadges({ todos }: { todos: unknown[] }): JSX.Element {
  const stats = parseTodoStats(todos);

  return (
    <div className="flex items-center gap-1">
      {stats.pending > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-luxury-500/20 text-[9px] text-luxury-300 font-medium tabular-nums">
          {stats.pending}
        </span>
      )}
      {stats.running > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-[9px] text-primary font-medium tabular-nums animate-pulse">
          {stats.running}
        </span>
      )}
      {stats.done > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[9px] text-emerald-400 font-medium tabular-nums">
          {stats.done}
        </span>
      )}
    </div>
  );
}

// Unified status configuration - matches sidebar Tasks exactly
const taskStatusConfig = {
  in_progress: {
    icon: '◐',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-300',
    textContent: 'text-gray-100',
    pulse: true,
  },
  pending: {
    icon: '○',
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-gray-500',
    textContent: 'text-gray-300',
    pulse: false,
  },
  completed: {
    icon: '✓',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
    text: 'text-emerald-400',
    textContent: 'text-gray-500',
    pulse: false,
  },
};

// Beautiful expanded task list display - unified with sidebar Tasks
function TodoListExpanded({ todos }: { todos: unknown[] }): JSX.Element {
  const parsedTodos = todos.filter(
    (t): t is { content: string; status: string; activeForm?: string } =>
      typeof t === 'object' && t !== null && 'content' in t && 'status' in t
  );

  if (parsedTodos.length === 0) {
    return <span className="text-gray-500 text-xs">No tasks</span>;
  }

  // Sort: in_progress first, then pending, then completed
  const inProgress = parsedTodos.filter((t) => t.status === 'in_progress');
  const pending = parsedTodos.filter((t) => t.status === 'pending');
  const completed = parsedTodos.filter((t) => t.status === 'completed');
  const ordered = [...inProgress, ...pending, ...completed];

  // Calculate progress
  const total = parsedTodos.length;
  const completedCount = completed.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-2.5">
      {/* Progress bar */}
      {total > 1 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">Progress</span>
            <span className="text-[10px] text-gray-400 tabular-nums">{completedCount}/{total}</span>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task items */}
      <div className="space-y-1">
        {ordered.map((todo, idx) => {
          const status = todo.status as keyof typeof taskStatusConfig;
          const config = taskStatusConfig[status] || taskStatusConfig.pending;
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <div
              key={idx}
              className={`
                flex items-start gap-2 px-2.5 py-1.5 rounded-lg
                ${config.bg} border ${config.border}
                ${isInProgress ? 'ring-1 ring-blue-500/20' : ''}
                transition-all duration-200
              `}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`
                    w-3.5 h-3.5 rounded-full flex items-center justify-center
                    ${config.bg} border ${config.border}
                    ${config.pulse ? 'animate-pulse' : ''}
                  `}
                >
                  <span className={`text-[8px] ${config.text}`}>{config.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    text-[11px] leading-relaxed font-medium
                    ${isCompleted ? 'text-gray-500 line-through decoration-gray-600' : config.textContent}
                  `}
                >
                  {todo.content}
                </p>
                {isInProgress && todo.activeForm && (
                  <p className="text-[9px] text-blue-400/70 mt-0.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                    <span className="truncate">{todo.activeForm}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ToolActivityGroupProps {
  activities: ToolActivity[];
}

export function ToolActivityGroup({ activities }: ToolActivityGroupProps): JSX.Element {
  if (activities.length === 0) return <></>;

  return (
    <div className="ml-14 mt-3 animate-widget-in">
      {/* Container with subtle glass effect */}
      <div className="
        relative
        bg-gradient-to-br from-white/[0.02] to-transparent
        rounded-2xl
        p-2.5
        border border-white/[0.03]
      ">
        {activities.map((activity, idx) => (
          <ToolActivityItem
            key={activity.toolCall.id}
            activity={activity}
            isLast={idx === activities.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// Utility to match tool calls with their results from message stream
export function matchToolCallsWithResults(
  messages: Message[],
  currentIndex: number
): ToolActivity[] {
  const currentMessage = messages[currentIndex];
  if (!currentMessage.toolCalls || currentMessage.toolCalls.length === 0) {
    return [];
  }

  const activities: ToolActivity[] = [];

  // Create a map of toolCallId -> result from subsequent tool messages
  const resultMap = new Map<string, { content: string; hasError: boolean }>();

  // Look at all subsequent messages for tool results
  for (let i = currentIndex + 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'tool' && msg.toolCallId) {
      // Better error detection - look for actual error markers, not just keywords
      // that might appear in normal output
      const content = typeof msg.content === 'string' ? msg.content : '';
      const hasError =
        (content.toLowerCase().includes('error:') && content.toLowerCase().includes('exception')) ||
        (content.toLowerCase().includes('traceback')) ||
        (content.toLowerCase().startsWith('error') && content.length < 500);
      resultMap.set(msg.toolCallId, { content: msg.content, hasError });
    }
    // Stop when we hit another assistant message (new turn)
    if (msg.role === 'assistant') break;
  }

  // Check if there's a more recent assistant message (indicates processing has continued)
  let hasMoreRecentAssistantMsg = false;
  for (let i = currentIndex + 1; i < messages.length; i++) {
    if (messages[i].role === 'assistant') {
      hasMoreRecentAssistantMsg = true;
      break;
    }
  }

  // Match each tool call with its result
  for (const toolCall of currentMessage.toolCalls) {
    const result = resultMap.get(toolCall.id);

    let status: ToolActivity['status'] = 'pending';
    if (result) {
      // Result exists for this tool - either success or error
      status = result.hasError ? 'error' : 'success';
    } else if (resultMap.size > 0 || hasMoreRecentAssistantMsg) {
      // Some results exist elsewhere, or processing continued beyond this set of tool calls
      // If we reached here without a result, this tool is still running
      status = 'running';
    }

    activities.push({
      toolCall,
      result: result?.content,
      status,
    });
  }

  return activities;
}
