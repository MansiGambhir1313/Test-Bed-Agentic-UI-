import { useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import type { ToolCall } from '../../types';

// Tool icons and colors mapping - Luxury theme
export const TOOL_CONFIG: Record<string, { icon: IconName; color: string; bgColor: string; gradient: string }> = {
  web_search: { icon: 'Globe', color: 'text-status-success', bgColor: 'bg-status-success/10', gradient: 'from-status-success/10 to-status-success/5' },
  fetch_url: { icon: 'Globe', color: 'text-status-success', bgColor: 'bg-status-success/10', gradient: 'from-status-success/10 to-status-success/5' },
  create_component: { icon: 'Code', color: 'text-primary', bgColor: 'bg-primary/10', gradient: 'from-primary/10 to-primary/5' },
  ls: { icon: 'Folder', color: 'text-accent-400', bgColor: 'bg-accent-400/10', gradient: 'from-accent-400/10 to-accent-400/5' },
  read_file: { icon: 'FileText', color: 'text-luxury-300', bgColor: 'bg-luxury-500/10', gradient: 'from-luxury-500/10 to-luxury-500/5' },
  write_file: { icon: 'PenTool', color: 'text-rose-400', bgColor: 'bg-rose-500/10', gradient: 'from-rose-500/10 to-rose-500/5' },
  edit_file: { icon: 'Edit', color: 'text-accent-500', bgColor: 'bg-accent-500/10', gradient: 'from-accent-500/10 to-accent-500/5' },
  glob: { icon: 'Search', color: 'text-status-info', bgColor: 'bg-status-info/10', gradient: 'from-status-info/10 to-status-info/5' },
  grep: { icon: 'Search', color: 'text-status-info', bgColor: 'bg-status-info/10', gradient: 'from-status-info/10 to-status-info/5' },
  execute: { icon: 'Terminal', color: 'text-status-error', bgColor: 'bg-status-error/10', gradient: 'from-status-error/10 to-status-error/5' },
  task: { icon: 'Cpu', color: 'text-rose-400', bgColor: 'bg-rose-500/10', gradient: 'from-rose-500/10 to-rose-500/5' },
  write_todos: { icon: 'LayoutList', color: 'text-primary', bgColor: 'bg-primary/10', gradient: 'from-primary/10 to-primary/5' },
};

const DEFAULT_CONFIG = {
  icon: 'Zap' as IconName,
  color: 'text-primary',
  bgColor: 'bg-primary/10',
  gradient: 'from-primary/10 to-primary/5'
};

export function getToolConfig(name: string) {
  return TOOL_CONFIG[name] || DEFAULT_CONFIG;
}

function formatArgValue(value: unknown): string {
  if (typeof value === 'string') {
    if (value.length > 100) {
      return `[${Math.ceil(value.length / 1024)} KB]`;
    }
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function getPreviewContent(args: Record<string, unknown>): { key: string; value: string } | null {
  if (args.file_path) return { key: 'file_path', value: String(args.file_path) };
  if (args.path) return { key: 'path', value: String(args.path) };
  if (args.query) return { key: 'query', value: String(args.query) };
  if (args.url) return { key: 'url', value: String(args.url) };
  if (args.pattern) return { key: 'pattern', value: String(args.pattern) };
  if (args.command) return { key: 'command', value: String(args.command) };
  if (args.description) return { key: 'description', value: String(args.description) };
  return null;
}

function getFileIcon(filePath: string): IconName {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, IconName> = {
    tsx: 'FileCode',
    ts: 'FileCode',
    jsx: 'FileCode',
    js: 'FileCode',
    json: 'FileJson',
    css: 'FileText',
    md: 'FileText',
    py: 'FileCode',
  };
  return iconMap[ext || ''] || 'FileText';
}

export type ToolStatus = 'pending' | 'running' | 'success' | 'error';

// Helper component for todo badges
function TodoBadges({ todos }: { todos: Array<{ status: string }> }): JSX.Element {
  const pending = todos.filter(t => t.status === 'pending').length;
  const inProgress = todos.filter(t => t.status === 'in_progress').length;
  const completed = todos.filter(t => t.status === 'completed').length;

  return (
    <div className="flex gap-1.5 mt-1">
      {pending > 0 && <span className="px-1.5 py-0.5 rounded-full bg-accent-400/20 text-[9px] text-accent-400 font-medium">{pending} pending</span>}
      {inProgress > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-[9px] text-primary font-medium">{inProgress} running</span>}
      {completed > 0 && <span className="px-1.5 py-0.5 rounded-full bg-status-success/20 text-[9px] text-status-success font-medium">{completed} done</span>}
    </div>
  );
}

interface ToolTimelineItemProps {
  toolCall: ToolCall;
  status?: ToolStatus;
  isLast?: boolean;
}

export function ToolTimelineItem({
  toolCall,
  status = 'success',
  isLast = false
}: ToolTimelineItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getToolConfig(toolCall.name);
  const preview = getPreviewContent(toolCall.args);

  const hasLargeContent = Object.values(toolCall.args).some(
    (v) => typeof v === 'string' && v.length > 100
  );

  // Special rendering for specific tools
  const isWriteFile = toolCall.name === 'write_file';
  const isTask = toolCall.name === 'task';
  const isWriteTodos = toolCall.name === 'write_todos';

  const filePath = isWriteFile ? String(toolCall.args.file_path || '') : '';
  const fileName = filePath.split('/').pop() || '';
  const fileDir = filePath.replace(fileName, '');

  return (
    <div className="relative pl-9 pb-3 animate-widget-in">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[13px] top-7 bottom-0 w-px timeline-line" />
      )}

      {/* Status node */}
      <div className="absolute left-0 top-1">
        {status === 'running' ? (
          <div className="w-7 h-7 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center animate-glow-pulse">
            <Icon name="Loader2" size={14} className="text-primary animate-spin" />
          </div>
        ) : status === 'error' ? (
          <div className="w-7 h-7 rounded-xl bg-status-error/20 border-2 border-status-error flex items-center justify-center">
            <Icon name="XCircle" size={14} className="text-status-error" />
          </div>
        ) : status === 'pending' ? (
          <div className="w-7 h-7 rounded-xl bg-luxury-600/20 border-2 border-luxury-500 animate-timeline-pulse" />
        ) : (
          <div className="w-7 h-7 rounded-xl bg-status-success/20 border-2 border-status-success flex items-center justify-center success-feedback">
            <Icon name="CheckCircle" size={14} className="text-status-success" />
          </div>
        )}
      </div>

      {/* Tool Card */}
      <div
        className={`
          bg-gradient-to-r ${config.gradient}
          backdrop-blur-xl
          border border-luxury-500/20
          rounded-xl
          overflow-hidden
          transition-all duration-300
          hover:border-luxury-500/30
          hover:shadow-lg hover:shadow-black/20
        `}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon
                name={isWriteFile ? getFileIcon(filePath) : config.icon}
                size={14}
                className={config.color}
              />
            </div>

            {isWriteFile && fileName ? (
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-luxury-100 truncate">{fileName}</div>
                <div className="text-xs text-luxury-500 truncate">{fileDir}</div>
              </div>
            ) : isTask && preview ? (
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-luxury-100">Sub-Agent Task</div>
                <div className="text-xs text-luxury-500 truncate">{preview.value}</div>
              </div>
            ) : isWriteTodos ? (
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs text-luxury-100">Updating todos</span>
                {toolCall.args.todos && Array.isArray(toolCall.args.todos) ? (
                  <TodoBadges todos={toolCall.args.todos as Array<{ status: string }>} />
                ) : null}
              </div>
            ) : (
              <>
                <span className="font-mono text-xs font-medium text-luxury-100">{toolCall.name}</span>
                {preview && (
                  <span className="text-xs text-luxury-500 truncate flex-1">{preview.value}</span>
                )}
              </>
            )}
          </div>

          <Icon
            name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
            size={12}
            className="text-luxury-500 shrink-0"
          />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-luxury-500/20 px-4 py-3 bg-luxury-900/40">
            <div className="space-y-2">
              {Object.entries(toolCall.args).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-luxury-500 font-mono">{key}:</span>
                  {typeof value === 'string' && value.length > 200 ? (
                    <div className="mt-1 p-3 bg-luxury-900 rounded-lg border border-luxury-600/20 overflow-x-auto max-h-[200px] overflow-y-auto mac-scrollbar">
                      <pre className="text-luxury-300 font-mono text-[10px] whitespace-pre-wrap">
                        {value.slice(0, 500)}
                        {value.length > 500 && (
                          <span className="text-luxury-500">... [{Math.ceil(value.length / 1024)} KB total]</span>
                        )}
                      </pre>
                    </div>
                  ) : (
                    <span className="text-luxury-300 font-mono ml-1">{formatArgValue(value)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed preview for large content */}
        {!isExpanded && hasLargeContent && (
          <div className="px-4 py-1.5 text-[10px] text-luxury-500 border-t border-luxury-500/10">
            Click to expand content...
          </div>
        )}
      </div>
    </div>
  );
}
