import { Icon } from '../ui/Icon';

export function ThinkingBubble(): JSX.Element {
  return (
    <div className="flex gap-4 animate-fade-in group">
      {/* Avatar matching AI bubble style */}
      <div className="
        relative
        w-10 h-10
        rounded-2xl
        bg-gradient-to-br from-violet-500/30 via-purple-600/25 to-fuchsia-600/20
        shrink-0
        flex items-center justify-center
        before:absolute before:inset-0 before:rounded-2xl before:border before:border-violet-400/30
        after:absolute after:inset-[-2px] after:rounded-2xl after:bg-gradient-to-br after:from-violet-500/10 after:to-transparent after:blur-sm after:-z-10
      ">
        <Icon name="Sparkles" size={18} className="text-violet-300 animate-pulse relative z-10" />
      </div>

      {/* Thinking indicator bubble */}
      <div className="
        relative
        bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]
        backdrop-blur-xl
        px-6 py-4
        rounded-[20px]
        flex items-center gap-2
        shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]
        before:absolute before:inset-0 before:rounded-[20px] before:border before:border-white/10 before:pointer-events-none
      ">
        <span className="w-2 h-2 bg-violet-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
        <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
        <span className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
      </div>
    </div>
  );
}
