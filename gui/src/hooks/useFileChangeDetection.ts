import { useState, useEffect, useRef, useMemo } from 'react';

export type FileChangeType = 'new' | 'modified' | null;

export interface FileChange {
  /** Path of the file that was created or modified */
  path: string;
  /** Type of change: 'new' for created files, 'modified' for updated files */
  type: 'new' | 'modified';
  /** Previous content of the file (empty string for new files) */
  previousContent: string;
}

export interface FileChangeResult {
  /** Path of the most recently changed file (for backwards compatibility) */
  changedFilePath: string | null;
  /** Type of change: 'new' for created files, 'modified' for updated files */
  changeType: FileChangeType;
  /** Previous content of the file (empty string for new files) */
  previousContent: string;
  /** All files changed in this session */
  allChanges: FileChange[];
  /** Total count of changed files */
  changesCount: number;
}

/**
 * Hook that detects ALL files that were created or modified.
 * Compares current files with previous state to detect changes.
 * Returns both the most recent change (for animation) and all changes (for notification).
 *
 * @param files - Current files dictionary (path -> content)
 * @param isLoading - Whether the agent is currently processing
 * @returns Information about changed files including all changes
 */
export function useFileChangeDetection(
  files: Record<string, string>,
  isLoading: boolean
): FileChangeResult {
  // Track all changes during this loading session
  const [allChanges, setAllChanges] = useState<FileChange[]>([]);
  // Most recent change for animation
  const [latestChange, setLatestChange] = useState<FileChange | null>(null);

  // Store previous files state (before current loading session started)
  const prevFilesRef = useRef<Record<string, string>>({});
  // Track files we've already detected as changed in this session
  const detectedChangesRef = useRef<Set<string>>(new Set());
  // Store baseline for this loading session
  const sessionBaselineRef = useRef<Record<string, string>>({});
  // Track if we're in a new loading session
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    // Detect transition from not-loading to loading (new session starts)
    if (isLoading && !wasLoadingRef.current) {
      // Save baseline at start of loading session
      sessionBaselineRef.current = { ...prevFilesRef.current };
      detectedChangesRef.current = new Set();
      setAllChanges([]);
    }
    wasLoadingRef.current = isLoading;

    // When loading finishes, save current state as previous for next run
    if (!isLoading) {
      prevFilesRef.current = { ...files };
      // Clear latest change but keep allChanges for potential re-deploy notification
      setLatestChange(null);
      return;
    }

    // During loading, detect changes against session baseline
    const baseline = sessionBaselineRef.current;
    const filePaths = Object.keys(files);
    const newChanges: FileChange[] = [];

    // Check all files for changes
    for (const path of filePaths) {
      // Skip if already detected in this session
      if (detectedChangesRef.current.has(path)) {
        continue;
      }

      const content = files[path];
      const baselineContent = baseline[path];

      if (baselineContent === undefined) {
        // New file created
        const change: FileChange = {
          path,
          type: 'new',
          previousContent: '',
        };
        newChanges.push(change);
        detectedChangesRef.current.add(path);
      } else if (baselineContent !== content) {
        // File was modified
        const change: FileChange = {
          path,
          type: 'modified',
          previousContent: baselineContent,
        };
        newChanges.push(change);
        detectedChangesRef.current.add(path);
      }
    }

    // If we found new changes, update state
    if (newChanges.length > 0) {
      setAllChanges(prev => [...prev, ...newChanges]);
      // Set the last change in the batch as the latest (for animation)
      setLatestChange(newChanges[newChanges.length - 1]);
      // Update baseline to include detected changes
      for (const change of newChanges) {
        sessionBaselineRef.current[change.path] = files[change.path];
      }
    }
  }, [files, isLoading]);

  // Memoize the result to avoid unnecessary re-renders
  const result = useMemo<FileChangeResult>(() => ({
    changedFilePath: latestChange?.path ?? null,
    changeType: latestChange?.type ?? null,
    previousContent: latestChange?.previousContent ?? '',
    allChanges,
    changesCount: allChanges.length,
  }), [latestChange, allChanges]);

  return result;
}

/**
 * Hook to track file changes after deployment for re-deploy notification.
 * Returns info about whether files have changed since last deployment.
 */
export function useFileChangesAfterDeploy(
  files: Record<string, string>,
  lastDeployedHash: string | null,
  isStreaming: boolean
): {
  hasChanges: boolean;
  changedFilesCount: number;
  changedFilesList: string[];
} {
  const deployedFilesRef = useRef<Record<string, string>>({});

  // Store files at deployment time
  useEffect(() => {
    if (lastDeployedHash) {
      deployedFilesRef.current = { ...files };
    }
  }, [lastDeployedHash]);

  // Calculate changes
  return useMemo(() => {
    if (!lastDeployedHash || isStreaming) {
      return { hasChanges: false, changedFilesCount: 0, changedFilesList: [] };
    }

    const deployedFiles = deployedFilesRef.current;
    const changedFiles: string[] = [];

    // Check for new or modified files
    for (const [path, content] of Object.entries(files)) {
      if (deployedFiles[path] === undefined || deployedFiles[path] !== content) {
        changedFiles.push(path);
      }
    }

    // Check for deleted files
    for (const path of Object.keys(deployedFiles)) {
      if (files[path] === undefined) {
        changedFiles.push(path);
      }
    }

    return {
      hasChanges: changedFiles.length > 0,
      changedFilesCount: changedFiles.length,
      changedFilesList: changedFiles,
    };
  }, [files, lastDeployedHash, isStreaming]);
}
