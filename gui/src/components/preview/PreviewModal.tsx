import { CodeBlock } from './CodeBlock';
import { Icon } from '../ui/Icon';
import type { FileNode } from '../../types';

interface FileIconProps {
  type: FileNode['type'];
}

function FileIcon({ type }: FileIconProps): JSX.Element {
  const colorClass =
    type === 'json'
      ? 'text-yellow-400'
      : type === 'py'
        ? 'text-blue-400'
        : type === 'tsx' || type === 'ts'
          ? 'text-blue-300'
          : type === 'css'
            ? 'text-blue-200'
            : type === 'md'
              ? 'text-pink-400'
              : 'text-luxury-200';

  const iconName =
    type === 'json'
      ? 'FileJson'
      : type === 'tsx' || type === 'ts' || type === 'js' || type === 'jsx' || type === 'css' || type === 'py'
        ? 'FileCode'
        : 'FileText';

  return <Icon name={iconName} size={16} className={colorClass} />;
}

interface PreviewModalProps {
  file: FileNode;
  content: string;
  isStreaming: boolean;
  onClose: () => void;
  /** Whether to animate with typewriter effect */
  animateTypewriter?: boolean;
  /** Previous content to start animation from */
  previousContent?: string;
}

export function PreviewModal({
  file,
  content,
  isStreaming,
  onClose,
  animateTypewriter = false,
  previousContent = '',
}: PreviewModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-8">
      <div className="w-full h-full max-w-6xl bg-dark-300 border border-white/10 rounded-xl shadow-2xl flex flex-col animate-expand overflow-hidden">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-dark-200">
          <div className="flex items-center gap-3">
            <FileIcon type={file.type} />
            <span className="font-mono text-sm text-white">{file.name}</span>
            {isStreaming && (
              <span className="text-[10px] text-yellow-500 animate-pulse">● Live Preview</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-luxury-200 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg flex items-center gap-2 text-xs font-medium"
          >
            <Icon name="Minimize2" size={14} /> Close Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto mac-scrollbar bg-dark-400">
          <CodeBlock
            code={content}
            language={file.type}
            className="text-sm font-mono leading-relaxed"
            isStreaming={isStreaming}
            animateTypewriter={animateTypewriter}
            previousContent={previousContent}
          />
        </div>
      </div>
    </div>
  );
}
