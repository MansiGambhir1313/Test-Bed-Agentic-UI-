import { ToolTimelineItem } from './ToolTimelineItem';
import type { ToolCall } from '../../types';

interface ToolTimelineProps {
  toolCalls: ToolCall[];
}

export function ToolTimeline({ toolCalls }: ToolTimelineProps): JSX.Element {
  return (
    <div className="relative ml-12 my-3">
      {toolCalls.map((call, index) => (
        <ToolTimelineItem
          key={call.id}
          toolCall={call}
          isLast={index === toolCalls.length - 1}
        />
      ))}
    </div>
  );
}
