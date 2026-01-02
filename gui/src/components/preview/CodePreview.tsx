import { CodeBlock } from './CodeBlock';
import { Icon } from '../ui/Icon';
import type { FileNode } from '../../types';

interface CodePreviewProps {
  selectedNode: FileNode | null;
  streamingFileId: string | null;
  onExpand: () => void;
  /** File ID currently being animated (for typewriter effect) */
  animatingFilePath: string | null;
  /** Previous content of the animating file (for diff-based animation) */
  animatingPreviousContent: string;
}

export function CodePreview({
  selectedNode,
  streamingFileId,
  onExpand,
  animatingFilePath,
  animatingPreviousContent,
}: CodePreviewProps): JSX.Element {
  const isStreaming = streamingFileId === selectedNode?.id;
  const shouldAnimate = animatingFilePath === selectedNode?.id;

  return (
    <div className="h-2/5 border-t border-luxury-500/20 bg-luxury-900/60 p-5 flex flex-col relative group transition-all shrink-0">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-400/20 to-transparent" />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-display font-bold text-luxury-400 uppercase tracking-widest">
            Preview
          </h3>
          {isStreaming && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onExpand}
          className="
            text-luxury-500
            hover:text-luxury-200
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            p-2
            bg-luxury-800/50
            rounded-lg
            border border-luxury-600/20
            hover:border-luxury-500/40
            hover:bg-luxury-700/50
          "
          title="Expand Preview"
        >
          <Icon name="Maximize2" size={14} />
        </button>
      </div>

      <div
        className="
          flex-1
          bg-luxury-900
          rounded-xl
          border border-luxury-600/20
          p-0
          overflow-hidden
          shadow-inner
          select-none
          cursor-pointer
          hover:border-luxury-500/30
          transition-all duration-300
        "
        onClick={onExpand}
      >
        <div
          key={selectedNode?.id}
          className="h-full overflow-hidden text-[11px] p-4 transition-opacity file-switch-enter"
        >
          {selectedNode && selectedNode.content !== undefined ? (
            <CodeBlock
              code={selectedNode.content}
              language={selectedNode.type}
              isStreaming={isStreaming}
              animateTypewriter={shouldAnimate}
              previousContent={shouldAnimate ? animatingPreviousContent : ''}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-luxury-800/30 border border-luxury-600/20 flex items-center justify-center mb-4 animate-float">
                <Icon name="FileCode" size={20} className="text-luxury-400/40" />
              </div>
              <span className="text-sm text-luxury-400">Select file</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
