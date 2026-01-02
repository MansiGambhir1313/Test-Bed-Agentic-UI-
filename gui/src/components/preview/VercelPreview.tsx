import { useVercelDeploy, DeployState } from '../../hooks/useVercelDeploy';
import { Icon, IconName } from '../ui/Icon';

interface VercelPreviewProps {
  files: Record<string, string>;
  isStreaming: boolean;
  threadId: string | null;
  /** Callback to send deployment error to chat for fixing */
  onAskToFix?: (error: string) => void;
}

const STATE_MESSAGES: Record<DeployState, string> = {
  idle: 'Ready to deploy',
  waiting: 'Auto-deploying...',
  preparing: 'Preparing deployment...',
  deploying: 'Uploading files...',
  building: 'Building project...',
  ready: 'Deployment ready!',
  error: 'Deployment failed',
};

const STATE_ICONS: Record<DeployState, IconName> = {
  idle: 'Upload',
  waiting: 'Loader',
  preparing: 'Loader',
  deploying: 'Loader',
  building: 'Loader',
  ready: 'CheckCircle',
  error: 'XCircle',
};

// Futuristic countdown ring with glow effects and animations
function CountdownRing({ countdown, total = 10 }: { countdown: number; total?: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = countdown / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 group">
      {/* Outer glow pulse effect */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-xl animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 70%)',
        }}
      />

      {/* Rotating outer ring decoration */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin"
        style={{ animationDuration: '8s' }}
      >
        <defs>
          <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle
          cx="72"
          cy="72"
          r="66"
          stroke="url(#outerGradient)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="8 12"
        />
      </svg>

      {/* Main SVG container */}
      <svg className="w-full h-full -rotate-90 relative z-10">
        <defs>
          {/* Gradient for progress arc */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow for depth */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Dark background track */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="#1e293b"
          strokeWidth="8"
          fill="none"
          filter="url(#shadow)"
        />

        {/* Subtle inner track */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="#334155"
          strokeWidth="6"
          fill="none"
        />

        {/* Progress arc with gradient and glow */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />

        {/* Glowing dot at progress end */}
        <circle
          cx="72"
          cy={72 - radius}
          r="4"
          fill="#fff"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out origin-center"
          style={{
            transform: `rotate(${(1 - progress) * 360}deg)`,
            transformOrigin: '72px 72px',
          }}
        />
      </svg>

      {/* Center content with glassmorphism effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center backdrop-blur-sm"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span
            className="text-4xl font-black bg-clip-text text-transparent"
            style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,255,255,0.3)',
            }}
          >
            {countdown}
          </span>
        </div>
      </div>

      {/* Particle effects around the ring */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400 opacity-60"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 60}deg) translateY(-58px)`,
              animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Epic building loader with orbital animations, hexagonal grid, and particle effects
function BuildingLoader({ fileCount }: { fileCount: number }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.06) 30%, rgba(15, 23, 42, 1) 70%)',
      }}
    >
      {/* Hexagonal grid background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg className="absolute w-full h-full" style={{ minWidth: '200%', minHeight: '200%', left: '-50%', top: '-50%' }}>
          <defs>
            <pattern id="hexGrid" width="56" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M28 2L54 18V50L28 66L2 50V18L28 2Z"
                fill="none"
                stroke="rgba(6, 182, 212, 0.3)"
                strokeWidth="0.5"
              />
              <path
                d="M28 68L54 84V116L28 132L2 116V84L28 68Z"
                fill="none"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" className="animate-hex-drift" />
        </svg>
      </div>

      {/* Pulsating energy waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border animate-energy-wave"
            style={{
              width: `${180 + i * 80}px`,
              height: `${180 + i * 80}px`,
              borderColor: i % 2 === 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main orb container */}
      <div className="relative z-10">
        {/* Outer rotating ring system */}
        <div className="absolute -inset-16 animate-orbit-slow">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ringGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#ringGradient1)"
              strokeWidth="1"
              strokeDasharray="20 30 60 30"
            />
          </svg>
        </div>

        {/* Middle rotating ring - opposite direction */}
        <div className="absolute -inset-10 animate-orbit-reverse">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ringGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="url(#ringGradient2)"
              strokeWidth="2"
              strokeDasharray="8 16 40 16"
            />
          </svg>
        </div>

        {/* Orbital particles */}
        <div className="absolute -inset-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-particle-orbit"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-4px',
                marginTop: '-4px',
                background: i % 2 === 0
                  ? 'radial-gradient(circle, #06b6d4 0%, transparent 70%)'
                  : 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
                boxShadow: i % 2 === 0
                  ? '0 0 10px #06b6d4, 0 0 20px #06b6d4'
                  : '0 0 10px #a855f7, 0 0 20px #a855f7',
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        {/* Core sphere with glow */}
        <div className="relative w-32 h-32">
          {/* Outer glow */}
          <div
            className="absolute -inset-4 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Core sphere */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.5) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(6, 182, 212, 0.4) 100%)
              `,
              boxShadow: `
                inset 0 0 40px rgba(255, 255, 255, 0.1),
                0 0 60px rgba(6, 182, 212, 0.4),
                0 0 120px rgba(139, 92, 246, 0.3)
              `,
            }}
          />

          {/* Inner energy core */}
          <div className="absolute inset-6 rounded-full animate-core-pulse">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(6, 182, 212, 0.6) 40%, transparent 70%)',
              }}
            />
          </div>

          {/* Rotating inner scanner line */}
          <div className="absolute inset-2 rounded-full overflow-hidden animate-scanner-rotate">
            <div
              className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom"
              style={{
                background: 'linear-gradient(to top, transparent 0%, rgba(6, 182, 212, 0.8) 50%, rgba(255, 255, 255, 0.9) 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating code particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs font-mono animate-code-float"
            style={{
              left: `${5 + (i * 4.5)}%`,
              top: `${100 + (i % 3) * 10}%`,
              color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#a855f7' : '#3b82f6',
              opacity: 0.6,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          >
            {['</', '/>', '{}', '()', '[]', '=>', '::'][i % 7]}
          </div>
        ))}
      </div>

      {/* Status text */}
      <div className="absolute bottom-16 left-0 right-0 text-center z-20">
        {/* Building text with animated letters */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {'Building project'.split('').map((char, i) => (
            <span
              key={i}
              className="text-lg font-semibold animate-text-wave"
              style={{
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                color: '#e2e8f0',
                animationDelay: `${i * 0.05}s`,
                display: char === ' ' ? 'inline' : 'inline-block',
                minWidth: char === ' ' ? '0.5em' : 'auto',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
          <span className="flex gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-dot-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        </div>

        {/* File count badge */}
        <div
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              background: 'linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {fileCount} files compiling
          </span>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes hex-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(56px, 100px); }
        }
        .animate-hex-drift {
          animation: hex-drift 20s linear infinite;
        }

        @keyframes energy-wave {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-energy-wave {
          animation: energy-wave 3s ease-out infinite;
        }

        @keyframes orbit-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit-slow {
          animation: orbit-slow 12s linear infinite;
        }

        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 8s linear infinite;
        }

        @keyframes particle-orbit {
          0% { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        .animate-particle-orbit {
          animation: particle-orbit 3s linear infinite;
        }

        @keyframes core-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .animate-core-pulse {
          animation: core-pulse 2s ease-in-out infinite;
        }

        @keyframes scanner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scanner-rotate {
          animation: scanner-rotate 2s linear infinite;
        }

        @keyframes code-float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-code-float {
          animation: code-float 6s linear infinite;
        }

        @keyframes text-wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-text-wave {
          animation: text-wave 1.5s ease-in-out infinite;
        }

        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        .animate-dot-bounce {
          animation: dot-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Animated file count badge
function FileCountBadge({ count }: { count: number }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
      }}
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span
        className="text-sm font-medium"
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          background: 'linear-gradient(90deg, #e2e8f0 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {count} files ready
      </span>
    </div>
  );
}

// Styled action button with glow effects
function ActionButton({
  children,
  onClick,
  variant = 'primary',
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm
        transition-all duration-300 ease-out
        flex items-center justify-center gap-2.5
        group overflow-hidden
        ${isPrimary
          ? 'text-white hover:scale-105 active:scale-95'
          : 'text-slate-300 hover:text-white hover:scale-105 active:scale-95'
        }
      `}
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: isPrimary
          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)'
          : 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
        boxShadow: isPrimary
          ? '0 4px 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: isPrimary ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
          animation: 'shimmer 2s infinite',
        }}
      />

      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function VercelPreview({
  files,
  isStreaming,
  threadId,
  onAskToFix,
}: VercelPreviewProps): JSX.Element {
  const {
    state,
    deploymentUrl,
    error,
    isConfigured,
    countdown,
    projectName,
    deploy,
    cancelAutoDeploy,
    deployNow,
    reset,
    hasPendingChanges,
    changedFilesSinceDeployCount,
    changedFilesSinceDeploy,
    dismissPendingChanges,
  } = useVercelDeploy(threadId, files, isStreaming);

  const hasFiles = Object.keys(files).length > 0;
  const isLoading = state === 'preparing' || state === 'deploying' || state === 'building';

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertTriangle" className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Vercel Not Configured
          </h3>
          <p className="text-sm text-luxury-200 mb-4">
            Add your Vercel API token to <code className="text-blue-400">.env</code> file:
          </p>
          <code className="block bg-dark-400 rounded-lg p-3 text-xs text-left text-luxury-100 font-mono">
            VERCEL_API_TOKEN=your_token_here
          </code>
          <p className="text-xs text-luxury-300 mt-3">
            Get your token at{' '}
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              vercel.com/account/tokens
            </a>
          </p>
        </div>
      </div>
    );
  }

  // No files state
  if (!hasFiles) {
    return (
      <div className="w-full h-full bg-dark-300 flex items-center justify-center">
        <div className="text-center text-luxury-300">
          <Icon name="FileCode" className="w-8 h-8 mx-auto mb-2 text-luxury-400" />
          <p className="text-sm">No files to deploy</p>
          <p className="text-xs mt-1 text-luxury-400">Generate files to deploy a preview</p>
        </div>
      </div>
    );
  }

  // Countdown state (waiting for auto-deploy)
  if (state === 'waiting') {
    return (
      <div
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 1) 50%, rgba(15, 23, 42, 1) 100%)',
        }}
      >
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 20s linear infinite',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i * 5) % 60}%`,
                background: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
                opacity: 0.4,
                animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="text-center max-w-md px-6 relative z-10">
          {/* Main countdown ring */}
          <div className="flex justify-center mb-8">
            <CountdownRing countdown={countdown} total={10} />
          </div>

          {/* Status text with gradient */}
          <p
            className="text-lg font-semibold mb-3"
            style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              background: 'linear-gradient(90deg, #e2e8f0 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Deploying in {countdown} seconds...
          </p>

          {/* File count badge */}
          <div className="mb-8">
            <FileCountBadge count={Object.keys(files).length} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <ActionButton
              onClick={deployNow}
              variant="primary"
              icon={<Icon name="Upload" className="w-4 h-4" />}
            >
              Deploy Now
            </ActionButton>
            <ActionButton
              onClick={cancelAutoDeploy}
              variant="secondary"
              icon={<Icon name="X" className="w-4 h-4" />}
            >
              Cancel
            </ActionButton>
          </div>
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
            50% { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Building state - show epic loading animation
  if (state === 'building') {
    return <BuildingLoader fileCount={Object.keys(files).length} />;
  }

  // Preparing/Deploying states - show similar but different themed loaders
  if (state === 'preparing' || state === 'deploying') {
    const isPreparing = state === 'preparing';
    const statusText = isPreparing ? 'Preparing deployment' : 'Uploading files';

    return (
      <div
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 1) 70%)',
        }}
      >
        {/* Animated circuit lines background */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          <svg className="absolute w-full h-full">
            <defs>
              <pattern id="circuitPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                <path
                  d="M0 50h30M70 50h30M50 0v30M50 70v30"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx="50" cy="50" r="4" fill="rgba(59, 130, 246, 0.3)" />
                <circle cx="30" cy="50" r="2" fill="rgba(139, 92, 246, 0.4)" />
                <circle cx="70" cy="50" r="2" fill="rgba(139, 92, 246, 0.4)" />
                <circle cx="50" cy="30" r="2" fill="rgba(6, 182, 212, 0.4)" />
                <circle cx="50" cy="70" r="2" fill="rgba(6, 182, 212, 0.4)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuitPattern)" />
          </svg>
        </div>

        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full animate-prep-pulse"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                border: '1px solid rgba(59, 130, 246, 0.2)',
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Main loader orb */}
        <div className="relative z-10">
          <div className="relative w-28 h-28">
            {/* Glow effect */}
            <div
              className="absolute -inset-6 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(15px)',
              }}
            />

            {/* Outer ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
              <defs>
                <linearGradient id="prepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="50"
                fill="none"
                stroke="url(#prepGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="100 200"
              />
            </svg>

            {/* Inner sphere */}
            <div
              className="absolute inset-4 rounded-full"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                  radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.4) 100%)
                `,
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            />

            {/* Upload icon or preparing icon */}
            <div className="absolute inset-0 flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
              <Icon
                name={isPreparing ? 'Cpu' : 'Upload'}
                className="w-8 h-8 text-white/80"
              />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="absolute bottom-16 left-0 right-0 text-center z-20">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span
              className="text-lg font-semibold"
              style={{
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {statusText}
            </span>
            <span className="flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                />
              ))}
            </span>
          </div>

          <FileCountBadge count={Object.keys(files).length} />
        </div>

        <style>{`
          @keyframes prep-pulse {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { opacity: 0.2; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .animate-prep-pulse {
            animation: prep-pulse 2s ease-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Ready state - show live preview in iframe
  if (state === 'ready' && deploymentUrl) {
    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-900">
        {/* Top toolbar */}
        <div
          className="shrink-0 px-3 py-2 flex items-center justify-between gap-2 border-b"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderColor: 'rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Left side - status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span
              className="text-xs font-medium text-emerald-400"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Live
            </span>
            {projectName && (
              <>
                <span className="text-slate-600">•</span>
                <span
                  className="text-xs text-slate-400 truncate max-w-[120px]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {projectName}
                </span>
              </>
            )}
          </div>

          {/* Right side - actions */}
          <div className="flex items-center gap-1.5">
            {/* Refresh iframe */}
            <button
              onClick={() => {
                const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                if (iframe) iframe.src = iframe.src;
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh preview"
            >
              <Icon name="RefreshCw" className="w-4 h-4" />
            </button>

            {/* Copy URL */}
            <button
              onClick={() => navigator.clipboard.writeText(deploymentUrl)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Copy URL"
            >
              <Icon name="FileCode" className="w-4 h-4" />
            </button>

            {/* Open in new tab */}
            <button
              onClick={() => window.open(deploymentUrl, '_blank')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Open in new tab"
            >
              <Icon name="ExternalLink" className="w-4 h-4" />
            </button>

            {/* Re-deploy */}
            <button
              onClick={() => deploy(files)}
              className="ml-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
              }}
            >
              <Icon name="RefreshCw" className="w-3 h-3" />
              Re-deploy
            </button>

            {/* Clear */}
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Clear deployment"
            >
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pending changes notification */}
        {hasPendingChanges && (
          <div
            className="shrink-0 px-3 py-2 flex items-center justify-between gap-2 border-b animate-slide-down"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.08) 100%)',
              borderColor: 'rgba(234, 179, 8, 0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span
                className="text-xs font-medium text-amber-400"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {changedFilesSinceDeployCount} file{changedFilesSinceDeployCount > 1 ? 's' : ''} changed
              </span>
              <span className="text-xs text-amber-300/60">
                ({changedFilesSinceDeploy.slice(0, 2).map(p => p.split('/').pop()).join(', ')}
                {changedFilesSinceDeployCount > 2 ? ` +${changedFilesSinceDeployCount - 2}` : ''})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => deploy(files)}
                className="px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                }}
              >
                Update
              </button>
              <button
                onClick={dismissPendingChanges}
                className="p-1 rounded-md text-amber-400/50 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
              >
                <Icon name="X" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Live preview iframe */}
        <div className="flex-1 relative overflow-hidden">
          {/* Loading shimmer while iframe loads */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
            }}
          />

          <iframe
            id="preview-iframe"
            src={deploymentUrl}
            className="absolute inset-0 w-full h-full border-0"
            style={{
              background: '#fff',
            }}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes slide-down {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Deploy UI (idle, loading, error states)
  const isError = state === 'error';

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: isError
          ? 'radial-gradient(ellipse at 50% 30%, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 1) 60%)'
          : isLoading
            ? 'radial-gradient(ellipse at 50% 30%, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 1) 60%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(100, 116, 139, 0.05) 0%, rgba(15, 23, 42, 1) 60%)',
      }}
    >
      {/* Subtle grid for idle/loading */}
      {!isError && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <div className="text-center max-w-sm px-6 relative z-10">
        {/* Status icon with effects */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-full ${isLoading ? 'animate-pulse' : ''}`}
            style={{
              background: isError
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)'
                : isLoading
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(100, 116, 139, 0.1) 0%, transparent 70%)',
            }}
          />
          {/* Icon container */}
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{
              background: isError
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)'
                : isLoading
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)',
              boxShadow: isError
                ? '0 0 30px rgba(239, 68, 68, 0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
                : isLoading
                  ? '0 0 30px rgba(59, 130, 246, 0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
                  : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
              border: isError
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : isLoading
                  ? '1px solid rgba(59, 130, 246, 0.3)'
                  : '1px solid rgba(100, 116, 139, 0.2)',
            }}
          >
            <Icon
              name={STATE_ICONS[state]}
              className={`w-8 h-8 ${
                isError
                  ? 'text-red-400'
                  : isLoading
                    ? 'text-blue-400 animate-spin'
                    : 'text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Status message */}
        <p
          className="text-base font-medium mb-5"
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            color: isError ? '#f87171' : '#e2e8f0',
          }}
        >
          {STATE_MESSAGES[state]}
        </p>

        {/* Error message */}
        {isError && error && (
          <div className="mb-5">
            <div
              className="rounded-xl p-4 mb-4 text-left"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <p
                className="text-xs break-words"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#fca5a5',
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* When streaming: only show waiting message */}
        {isStreaming ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.1) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping opacity-50" />
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#fbbf24',
                }}
              >
                Generating...
              </span>
            </div>
            <FileCountBadge count={Object.keys(files).length} />
          </div>
        ) : (
          <>
            {/* Action buttons - uniform width */}
            {(state === 'idle' || isError) && (
              <div className="flex flex-col items-center gap-3 mb-4 w-full max-w-[220px] mx-auto">
                {isError && onAskToFix && error && (
                  <button
                    onClick={() => onAskToFix(error)}
                    className="w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                      color: 'white',
                    }}
                  >
                    <Icon name="MessageSquare" className="w-4 h-4" />
                    Ask to Fix This Error
                  </button>
                )}
                {hasFiles ? (
                  <button
                    onClick={() => deploy(files)}
                    className="w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
                      color: 'white',
                    }}
                  >
                    <Icon name="Upload" className="w-4 h-4" />
                    {isError ? 'Try Again' : 'Deploy to Vercel'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-3 rounded-xl font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      color: '#64748b',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}
                  >
                    <Icon name="Upload" className="w-4 h-4" />
                    Deploy to Vercel
                  </button>
                )}
              </div>
            )}

            {/* File count badge */}
            <div className="mt-4">
              <FileCountBadge count={Object.keys(files).length} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
