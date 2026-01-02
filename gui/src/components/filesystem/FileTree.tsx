import { FileTreeItem } from './FileTreeItem';
import { Icon } from '../ui/Icon';
import type { FileNode } from '../../types';

interface FileTreeProps {
  nodes: FileNode[];
  selectedNode: FileNode | null;
  streamingFileId: string | null;
  onSelectNode: (node: FileNode) => void;
}

export function FileTree({
  nodes,
  selectedNode,
  streamingFileId,
  onSelectNode,
}: FileTreeProps): JSX.Element {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="w-12 h-12 rounded-xl bg-luxury-800/50 border border-luxury-600/20 flex items-center justify-center mb-4 animate-float">
          <Icon name="Folder" size={20} className="text-accent-400/40" />
        </div>
        <p className="text-sm font-medium text-luxury-300">Empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          level={0}
          selectedNode={selectedNode}
          streamingFileId={streamingFileId}
          onSelect={onSelectNode}
        />
      ))}
    </div>
  );
}
