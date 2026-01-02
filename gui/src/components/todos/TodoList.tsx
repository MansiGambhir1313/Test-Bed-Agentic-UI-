import { Icon } from '../ui/Icon';
import { TodoSection } from './TodoSection';
import type { TodoItem } from '../../types';

interface TodoListProps {
  todos: TodoItem[];
  /** Compact mode for inline display */
  compact?: boolean;
}

export function TodoList({ todos, compact = false }: TodoListProps): JSX.Element {
  const pending = todos.filter((t) => t.status === 'pending');
  const inProgress = todos.filter((t) => t.status === 'in_progress');
  const completed = todos.filter((t) => t.status === 'completed');

  // Calculate progress
  const total = todos.length;
  const completedCount = completed.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-5 p-3'}>
      {/* Progress Header - only show in non-compact mode when there are tasks */}
      {!compact && total > 0 && (
        <div className="px-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Progress
            </span>
            <span className="text-xs text-gray-400 tabular-nums">
              {completedCount}/{total}
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <TodoSection
          title="In Progress"
          todos={inProgress}
          status="in_progress"
          icon="Loader2"
          compact={compact}
        />
      )}

      {/* Pending Section */}
      {pending.length > 0 && (
        <TodoSection
          title="Pending"
          todos={pending}
          status="pending"
          icon="Circle"
          compact={compact}
        />
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <TodoSection
          title="Completed"
          todos={completed}
          status="completed"
          icon="CheckCircle"
          compact={compact}
        />
      )}

      {/* Empty State */}
      {todos.length === 0 && !compact && (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-luxury-800/50 border border-luxury-600/20 flex items-center justify-center animate-float">
            <Icon name="CheckCircle" size={20} className="text-status-success/40" />
          </div>
          <p className="text-sm font-medium text-luxury-300">Clear</p>
        </div>
      )}
    </div>
  );
}
