import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { FileNode } from '../../types';

interface FileIconProps {
  type: FileNode['type'];
  selected: boolean;
}

function FileIcon({ type, selected }: FileIconProps): JSX.Element {
  const colorClass = selected
    ? 'text-luxury-50'
    : type === 'json'
      ? 'text-accent-400'
      : type === 'py'
        ? 'text-primary'
        : type === 'tsx' || type === 'ts'
          ? 'text-primary/80'
          : type === 'css'
            ? 'text-rose-400'
            : type === 'folder'
              ? 'text-accent-400'
              : type === 'md'
                ? 'text-rose-400'
                : 'text-luxury-400';

  const iconName =
    type === 'json'
      ? 'FileJson'
      : type === 'folder'
        ? 'Folder'
        : type === 'tsx' || type === 'ts' || type === 'js' || type === 'jsx' || type === 'css' || type === 'py'
          ? 'FileCode'
          : 'FileText';

  return <Icon name={iconName} size={16} className={colorClass} />;
}

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  selectedNode: FileNode | null;
  streamingFileId: string | null;
  onSelect: (node: FileNode) => void;
}

export function FileTreeItem({
  node,
  level,
  selectedNode,
  streamingFileId,
  onSelect,
}: FileTreeItemProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);

  const isFolder = node.type === 'folder';
  const isSelected = selectedNode?.id === node.id;
  const isStreaming = streamingFileId === node.id;
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div className="animate-slide-in-right">
      <div
        onClick={handleClick}
        className={`
          group
          flex items-center
          py-2 px-2.5
          rounded-xl
          cursor-pointer
          text-xs
          transition-all duration-300
          select-none
          ${
            isSelected
              ? 'bg-gradient-to-r from-primary/25 to-primary/10 text-luxury-50 shadow-lg shadow-primary/10 border border-primary/30'
              : 'text-luxury-50 hover:bg-luxury-750 border border-transparent hover:border-luxury-500/20'
          }
          ${isStreaming ? 'writing-active' : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isFolder && (
          <span
            onClick={handleToggle}
            className="mr-1 p-0.5 rounded hover:bg-luxury-600/50 text-luxury-400 hover:text-luxury-200 transition-colors duration-200"
          >
            <Icon name={isOpen ? 'ChevronDown' : 'ChevronRight'} size={12} />
          </span>
        )}
        {!isFolder && <span className="w-4 mr-1" />}

        <div className="mr-2 opacity-90 relative">
          {isStreaming ? (
            <Icon name="Loader2" size={16} className="text-accent-400 animate-spin" />
          ) : isFolder ? (
            <Icon
              name={isOpen ? 'FolderOpen' : 'Folder'}
              size={16}
              className={isSelected ? 'text-luxury-50' : 'text-accent-400'}
            />
          ) : (
            <FileIcon type={node.type} selected={isSelected} />
          )}
        </div>

        <span
          className={`font-medium truncate ${
            isSelected ? 'text-luxury-50' : isStreaming ? 'text-accent-400' : 'text-luxury-50'
          }`}
        >
          {node.name}
          {isStreaming && (
            <span className="ml-2 text-[10px] text-accent-400/70 italic">writing...</span>
          )}
        </span>
      </div>

      {isFolder && isOpen && hasChildren && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedNode={selectedNode}
              streamingFileId={streamingFileId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
