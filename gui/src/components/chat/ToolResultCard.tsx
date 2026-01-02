import { Icon } from '../ui/Icon';
import type { Message } from '../../types';
import { getMessageText } from '../../types';

interface ToolResultCardProps {
  message: Message;
}

export function ToolResultCard({ message }: ToolResultCardProps): JSX.Element {
  const toolName = message.toolName || 'tool';
  // Safely extract content as string (handles Anthropic API format)
  const contentText = getMessageText(message.content);
  const isSuccess = !contentText.toLowerCase().includes('error');
  const isLongContent = contentText.length > 200;

  return (
    <div className="animate-widget-in ml-12 my-1">
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5
          rounded-full text-xs
          backdrop-blur-xl
          transition-all duration-200
          ${isSuccess
            ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
            : 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/15'
          }
        `}
      >
        <Icon
          name={isSuccess ? 'CheckCircle' : 'XCircle'}
          size={12}
          className={isSuccess ? 'text-green-400' : 'text-red-400'}
        />
        <span className={isSuccess ? 'text-green-300' : 'text-red-300'}>
          {toolName}
        </span>
      </div>

      {/* Show content preview for longer results */}
      {isLongContent && (
        <div className="mt-1.5 ml-0 p-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/5 max-h-[100px] overflow-hidden">
          <pre className="text-[10px] text-luxury-200 font-mono whitespace-pre-wrap">
            {contentText.slice(0, 200)}...
          </pre>
        </div>
      )}

      {/* Show short content inline */}
      {!isLongContent && contentText && (
        <div className="mt-1 text-[11px] text-luxury-200 ml-1">
          {contentText.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
