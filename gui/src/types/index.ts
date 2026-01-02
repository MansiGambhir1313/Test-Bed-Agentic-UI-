// Content block from LangGraph streaming
export interface MessageContentBlock {
  text: string;
  type: string;
  index?: number;
}

export type MessageContent = string | MessageContentBlock | MessageContentBlock[];

// Tool call structure from LangGraph
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// Tool call with UI status for rendering
export interface ToolCallUI extends ToolCall {
  result?: string;
  status: 'pending' | 'completed' | 'error' | 'interrupted';
}

// Raw message from LangGraph API (uses "type" not "role"!)
export interface RawMessage {
  id?: string;
  type?: 'human' | 'ai' | 'tool' | 'system';
  role?: string;  // fallback for some formats
  content: MessageContent;
  tool_calls?: ToolCall[];
  tool_call_id?: string;  // for ToolMessage
  name?: string;          // tool name for ToolMessage
}

// Normalized message for UI rendering
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;  // ALWAYS a string after normalization!
  toolCalls?: ToolCall[];
  toolCallId?: string;
  toolName?: string;
  timestamp?: string;
}

// Extract text from MessageContent (handles ALL formats including Anthropic API)
export function getMessageText(content: unknown): string {
  // String: already ok
  if (typeof content === 'string') return content;

  // Null/undefined: empty string
  if (content == null) return '';

  // Array of content blocks [{type: "text", text: "..."}]
  if (Array.isArray(content)) {
    return content
      .filter((block): block is { text: string; type: string } =>
        block && typeof block === 'object' && 'text' in block && typeof block.text === 'string'
      )
      .map((block) => block.text)
      .join('');
  }

  // Single content block {type: "text", text: "...", index: 0}
  if (typeof content === 'object' && 'text' in content) {
    const textValue = (content as { text: unknown }).text;
    return typeof textValue === 'string' ? textValue : '';
  }

  // Fallback: stringify if possible
  try {
    return String(content);
  } catch {
    return '';
  }
}

// Normalize a raw LangGraph message to our UI format
export function normalizeMessage(msg: RawMessage, idx: number): Message {
  // Determine role from type field (LangGraph format)
  let role: Message['role'] = 'assistant';
  if (msg.type === 'human' || msg.role === 'user' || msg.role === 'human') {
    role = 'user';
  } else if (msg.type === 'tool') {
    role = 'tool';
  }

  // Extract text content
  const content = getMessageText(msg.content);

  return {
    id: msg.id || `msg_${idx}`,
    role,
    content,
    toolCalls: msg.tool_calls,
    toolCallId: msg.tool_call_id,
    toolName: msg.name,
  };
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'tsx' | 'ts' | 'js' | 'jsx' | 'json' | 'css' | 'md' | 'py' | 'text';
  content?: string;
  children?: FileNode[];
  size?: string;
}

// TodoItem matching LangGraph SDK format
export interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm?: string;
  updatedAt?: Date;
}

// Legacy TodoItem for backward compatibility
export interface LegacyTodoItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Skill {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface MemoryFile {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  content: string;
}

// File content from backend can be either a string or an object with metadata
export interface FileWithMetadata {
  content: string;
  created_at: string;
  modified_at: string;
}

export type FileContent = string | FileWithMetadata;

export interface AgentState {
  messages: RawMessage[];
  files: Record<string, FileContent>;
  todos: TodoItem[];
}

/**
 * Normalize file content from various formats that LangGraph SDK may return:
 * - string: direct content
 * - { content: string }: object with content property
 * - { content: string[] }: object with array of lines (join with newlines)
 * - FileWithMetadata: object with content and timestamps
 */
export function normalizeFileContent(rawContent: unknown): string {
  // Direct string
  if (typeof rawContent === 'string') {
    return rawContent;
  }

  // Null/undefined
  if (rawContent == null) {
    return '';
  }

  // Object with content property
  if (typeof rawContent === 'object' && 'content' in rawContent) {
    const content = (rawContent as { content: unknown }).content;

    // Array of lines - join with newlines
    if (Array.isArray(content)) {
      return content.join('\n');
    }

    // String content
    if (typeof content === 'string') {
      return content;
    }

    return String(content || '');
  }

  // Fallback
  return String(rawContent || '');
}

// Normalize all files from API response
export function normalizeFiles(files: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [path, fileContent] of Object.entries(files)) {
    result[path] = normalizeFileContent(fileContent);
  }
  return result;
}

export interface StreamEvent {
  event: 'metadata' | 'values' | 'updates' | 'end' | 'error';
  data: unknown;
}

export interface RunMetadata {
  run_id: string;
  thread_id: string;
}

export type PreviewMode = 'code' | 'app';
export type RightPanelTab = 'filesystem' | 'todos';
