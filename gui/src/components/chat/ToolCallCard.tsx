import { useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import type { ToolCall } from '../../types';

// Tool icons and colors mapping
const TOOL_CONFIG: Record<string, { icon: IconName; color: string; bgColor: string }> = {
  web_search: { icon: 'Globe', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  fetch_url: { icon: 'Globe', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  create_component: { icon: 'Code', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  ls: { icon: 'Folder', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  read_file: { icon: 'FileText', color: 'text-luxury-200', bgColor: 'bg-luxury-500/10' },
  write_file: { icon: 'PenTool', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  edit_file: { icon: 'Edit', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  glob: { icon: 'Search', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  grep: { icon: 'Search', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  execute: { icon: 'Terminal', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  task: { icon: 'Cpu', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  write_todos: { icon: 'LayoutList', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
};

const DEFAULT_CONFIG = { icon: 'Zap' as IconName, color: 'text-primary', bgColor: 'bg-primary/10' };

function getToolConfig(name: string) {
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
  // For file operations, show the file path
  if (args.file_path) {
    return { key: 'file_path', value: String(args.file_path) };
  }
  if (args.path) {
    return { key: 'path', value: String(args.path) };
  }
  if (args.query) {
    return { key: 'query', value: String(args.query) };
  }
  if (args.url) {
    return { key: 'url', value: String(args.url) };
  }
  if (args.pattern) {
    return { key: 'pattern', value: String(args.pattern) };
  }
  if (args.command) {
    return { key: 'command', value: String(args.command) };
  }
  return null;
}

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getToolConfig(toolCall.name);
  const preview = getPreviewContent(toolCall.args);

  const hasLargeContent = Object.values(toolCall.args).some(
    (v) => typeof v === 'string' && v.length > 100
  );

  return (
    <div className="animate-slide-in-right ml-12 my-2">
      <div
        className={`rounded-lg border border-white/10 overflow-hidden ${config.bgColor}`}
        style={{ borderLeftWidth: '3px', borderLeftColor: config.color.replace('text-', '').replace('-400', '') }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${config.bgColor}`}>
              <Icon name={config.icon} size={14} className={config.color} />
            </div>
            <span className="font-mono text-xs font-medium text-white">{toolCall.name}</span>
            {preview && (
              <span className="text-xs text-luxury-200 truncate max-w-[200px]">
                {preview.value}
              </span>
            )}
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <Icon
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              size={12}
              className="text-luxury-200"
            />
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-white/10 px-3 py-2 bg-black/20">
            <div className="space-y-2">
              {Object.entries(toolCall.args).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-luxury-300 font-mono">{key}:</span>
                  {typeof value === 'string' && value.length > 200 ? (
                    <div className="mt-1 p-2 bg-dark-400 rounded border border-white/5 overflow-x-auto max-h-[200px] overflow-y-auto mac-scrollbar">
                      <pre className="text-luxury-100 font-mono text-[10px] whitespace-pre-wrap">
                        {value.slice(0, 500)}
                        {value.length > 500 && (
                          <span className="text-luxury-300">... [{Math.ceil(value.length / 1024)} KB total]</span>
                        )}
                      </pre>
                    </div>
                  ) : (
                    <span className="text-luxury-100 font-mono ml-1">{formatArgValue(value)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed preview for large content */}
        {!isExpanded && hasLargeContent && (
          <div className="px-3 py-1 text-[10px] text-luxury-300 border-t border-white/5">
            Click to expand content...
          </div>
        )}
      </div>
    </div>
  );
}
