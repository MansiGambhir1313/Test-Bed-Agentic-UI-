import type { FileNode, MemoryFile } from '../types';

function getFileType(filename: string): FileNode['type'] {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
      return 'tsx';
    case 'ts':
      return 'ts';
    case 'js':
      return 'js';
    case 'jsx':
      return 'jsx';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'md':
      return 'md';
    case 'py':
      return 'py';
    default:
      return 'text';
  }
}

function generateId(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Create a simple hash of the file paths for quick comparison
 */
export function getFilesHash(files: Record<string, string>): string {
  const paths = Object.keys(files).filter(
    p => !p.startsWith('/memory/') && !p.startsWith('memory/')
  ).sort();
  return paths.join('|');
}

/**
 * Build file tree from flat file dictionary.
 * This function is memoization-friendly - it will return the same object
 * if nothing changed.
 */
export function flatFilesToTree(files: Record<string, string>): FileNode[] {
  const root: FileNode = {
    id: 'root',
    name: 'workspace',
    type: 'folder',
    children: [],
  };

  const paths = Object.keys(files).sort();

  for (const fullPath of paths) {
    // Skip memory files - they are shown in the Memory tab
    if (fullPath.startsWith('/memory/') || fullPath.startsWith('memory/')) {
      continue;
    }
    const content = files[fullPath];
    const parts = fullPath.replace(/^\//, '').split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (isFile) {
        const fileNode: FileNode = {
          id: generateId(currentPath),
          name: part,
          type: getFileType(part),
          content,
          size: `${Math.ceil(content.length / 1024)} KB`,
        };
        current.children = current.children || [];
        current.children.push(fileNode);
      } else {
        let folder = current.children?.find((c) => c.name === part && c.type === 'folder');
        if (!folder) {
          folder = {
            id: generateId(currentPath),
            name: part,
            type: 'folder',
            children: [],
          };
          current.children = current.children || [];
          current.children.push(folder);
        }
        current = folder;
      }
    }
  }

  sortTree(root);
  return root.children || [];
}

/**
 * Incrementally update the file tree when only content changes.
 * Returns the same tree reference if structure hasn't changed,
 * or a new tree with updated nodes if content changed.
 * This avoids full tree rebuilds for simple content updates.
 */
export function updateTreeContent(
  tree: FileNode[],
  files: Record<string, string>,
  changedPaths: string[]
): FileNode[] {
  if (changedPaths.length === 0) {
    return tree;
  }

  // Create a set of changed IDs for quick lookup
  const changedIds = new Set(
    changedPaths.map(p => generateId(p.replace(/^\//, '')))
  );

  // Deep clone and update only changed nodes
  const updateNode = (node: FileNode): FileNode => {
    if (changedIds.has(node.id)) {
      // Find matching file path by ID
      for (const [path, content] of Object.entries(files)) {
        if (generateId(path.replace(/^\//, '')) === node.id) {
          return {
            ...node,
            content,
            size: `${Math.ceil(content.length / 1024)} KB`,
          };
        }
      }
    }

    if (node.children) {
      const updatedChildren = node.children.map(updateNode);
      // Only create new array if children actually changed
      const hasChanges = updatedChildren.some((child, i) => child !== node.children![i]);
      if (hasChanges) {
        return { ...node, children: updatedChildren };
      }
    }

    return node;
  };

  return tree.map(updateNode);
}

function sortTree(node: FileNode): void {
  if (!node.children) return;

  node.children.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  for (const child of node.children) {
    sortTree(child);
  }
}

export function findNodeById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find a node by its original file path.
 * Converts the path to an ID and searches the tree.
 */
export function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
  // Normalize path: remove leading slash and generate ID
  const normalizedPath = path.replace(/^\//, '');
  const id = generateId(normalizedPath);
  return findNodeById(nodes, id);
}

/**
 * Generate ID from path (exported for use in other modules)
 */
export function pathToId(path: string): string {
  const normalizedPath = path.replace(/^\//, '');
  return generateId(normalizedPath);
}

export function updateNodeContent(
  nodes: FileNode[],
  id: string,
  content: string
): FileNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, id, content) };
    }
    return node;
  });
}

/**
 * Extract memory files from the files object
 * Memory files are stored under /memory/ path
 */
export function extractMemoryFiles(files: Record<string, string>): MemoryFile[] {
  const memoryFiles: MemoryFile[] = [];

  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith('/memory/') || path.startsWith('memory/')) {
      const filename = path.split('/').pop() || path;
      const ext = filename.split('.').pop()?.toLowerCase() || 'text';

      memoryFiles.push({
        id: path.replace(/[^a-zA-Z0-9]/g, '_'),
        name: filename,
        type: ext === 'md' ? 'Markdown' : ext === 'json' ? 'JSON' : 'Text',
        date: new Date().toLocaleDateString(),
        size: `${Math.ceil(content.length / 1024)} KB`,
        content,
      });
    }
  }

  return memoryFiles;
}
