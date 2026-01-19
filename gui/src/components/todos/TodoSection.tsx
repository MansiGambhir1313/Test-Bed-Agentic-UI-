import { Icon, IconName } from '../ui/Icon';
import type { TodoItem } from '../../types';

interface TodoSectionProps {
  title: string;
  todos: TodoItem[];
  status: 'in_progress' | 'pending' | 'completed';
  icon: IconName;
  /** Compact mode for chat inline display */
  compact?: boolean;
}

// Unified status configuration - matches chat Tasks exactly
const statusConfig = {
  in_progress: {
    icon: '◐',
    headerIcon: 'Loader2' as IconName,
    headerColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    glow: 'shadow-blue-500/15',
    textColor: 'text-gray-100',
    pulse: true,
  },
  pending: {
    icon: '○',
    headerIcon: 'Circle' as IconName,
    headerColor: 'text-gray-400',
    bg: 'bg-white/5',
    border: 'border-white/10',
    dot: 'bg-gray-500',
    glow: 'shadow-white/5',
    textColor: 'text-gray-300',
    pulse: false,
  },
  completed: {
    icon: '✓',
    headerIcon: 'CheckCircle' as IconName,
    headerColor: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
    dot: 'bg-emerald-400',
    glow: 'shadow-emerald-500/10',
    textColor: 'text-gray-300',
    pulse: false,
  },
};

export function TodoSection({ title, todos, status, icon, compact = false }: TodoSectionProps): JSX.Element {
  const config = statusConfig[status];

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className={config.pulse ? 'animate-spin-slow' : ''}>
          <Icon
            name={icon}
            size={compact ? 10 : 12}
            className={config.headerColor}
          />
        </div>
        <span className={`text-xs font-semibold tracking-wide ${config.headerColor}`}>
          {title}
        </span>
        <span className="text-[10px] text-gray-500 tabular-nums">
          ({todos.length})
        </span>
      </div>

      {/* Task Items */}
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        {todos.map((todo, idx) => (
          <TaskItem
            key={todo.id || `todo_${status}_${idx}`}
            todo={todo}
            status={status}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

interface TaskItemProps {
  todo: TodoItem;
  status: 'in_progress' | 'pending' | 'completed';
  compact?: boolean;
}

function TaskItem({ todo, status, compact = false }: TaskItemProps): JSX.Element {
  const config = statusConfig[status];
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <div
      className={`
        ${config.bg}
        border ${config.border}
        ${compact ? 'rounded-lg px-2.5 py-1.5' : 'rounded-xl px-3.5 py-2.5'}
        backdrop-blur-sm
        transition-all duration-300
        hover:bg-white/[0.03]
        ${!compact ? `hover:-translate-y-0.5 hover:shadow-lg ${config.glow}` : ''}
        ${isInProgress ? 'ring-1 ring-blue-500/20' : ''}
        animate-fade-in
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Status indicator */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`
              ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}
              rounded-full flex items-center justify-center
              ${config.bg} border ${config.border}
              ${config.pulse ? 'animate-pulse' : ''}
            `}
          >
            <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} ${isCompleted ? 'text-emerald-400' : isInProgress ? 'text-blue-300' : 'text-gray-500'}`}>
              {config.icon}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`
              ${compact ? 'text-[11px]' : 'text-sm'}
              leading-relaxed font-medium
              ${isCompleted ? 'text-gray-200 line-through decoration-gray-400' : config.textColor}
            `}
          >
            {todo.content}
          </p>

          {/* Active form indicator for in-progress tasks */}
          {isInProgress && todo.activeForm && (
            <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-blue-400/70 mt-0.5 flex items-center gap-1.5`}>
              <span className="inline-block w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
              <span className="truncate">{todo.activeForm}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Export for reuse in chat Tasks
export { statusConfig };
