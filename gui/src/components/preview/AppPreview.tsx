import { VercelPreview } from './VercelPreview';

interface AppPreviewProps {
  files: Record<string, string>;
  isStreaming: boolean;
  hasNavbar: boolean;
  threadId: string | null;
  /** Callback to send deployment error to chat for fixing */
  onAskToFix?: (error: string) => void;
}

export function AppPreview({
  files,
  isStreaming,
  hasNavbar,
  threadId,
  onAskToFix,
}: AppPreviewProps): JSX.Element {
  return (
    <div className="w-full h-full bg-dark-300 flex flex-col overflow-hidden">
      {/* Header with streaming indicator */}
      {hasNavbar && (
        <div className="h-8 bg-dark-400 border-b border-white/10 flex items-center px-3 shrink-0">
          <span className="text-[10px] text-luxury-300 font-medium uppercase tracking-wider">
            Vercel Preview
          </span>
          {isStreaming && (
            <span className="ml-2 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
          )}
        </div>
      )}

      {/* Preview content */}
      <div className="flex-1 overflow-hidden">
        <VercelPreview files={files} isStreaming={isStreaming} threadId={threadId} onAskToFix={onAskToFix} />
      </div>
    </div>
  );
}
