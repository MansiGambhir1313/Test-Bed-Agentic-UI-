import { useState, useCallback, useRef, useEffect } from 'react';
import {
  deployToVercel,
  isVercelConfigured,
  DeploymentStatus,
} from '../api/vercel';

export type DeployState =
  | 'idle'
  | 'waiting' // countdown before auto-deploy
  | 'preparing'
  | 'deploying'
  | 'building'
  | 'ready'
  | 'error';

interface StoredDeployment {
  url: string;
  projectName: string;
  timestamp: number;
}

const STORAGE_PREFIX = 'vercel-deployment-';
const AUTO_DEPLOY_DELAY = 4; // seconds

/**
 * Normalize URL to ensure it has https:// prefix
 */
function normalizeUrl(url: string): string {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Check if the project has the minimum required files for a React deployment
 * Requires: package.json + at least one .tsx or .jsx component
 */
function isProjectComplete(files: Record<string, string>): boolean {
  const filePaths = Object.keys(files);
  const hasPackageJson = filePaths.some(p => p.endsWith('package.json'));
  const hasReactComponent = filePaths.some(p => p.endsWith('.tsx') || p.endsWith('.jsx'));
  return hasPackageJson && hasReactComponent;
}

export interface UseVercelDeployReturn {
  /** Current deployment state */
  state: DeployState;
  /** Deployment URL (available when ready) */
  deploymentUrl: string | null;
  /** Error message (available when error) */
  error: string | null;
  /** Whether Vercel is configured */
  isConfigured: boolean;
  /** Countdown seconds before auto-deploy (0 when not waiting) */
  countdown: number;
  /** Project name from last deployment */
  projectName: string | null;
  /** Start deployment immediately */
  deploy: (files: Record<string, string>, projectName?: string) => Promise<void>;
  /** Cancel auto-deploy countdown */
  cancelAutoDeploy: () => void;
  /** Trigger deploy now (skip countdown) */
  deployNow: () => void;
  /** Reset state */
  reset: () => void;
  /** Hash of deployed files (for tracking changes) */
  deployedFilesHash: string | null;
  /** Number of files that changed since last deployment */
  changedFilesSinceDeployCount: number;
  /** List of file paths that changed since last deployment */
  changedFilesSinceDeploy: string[];
  /** Whether there are pending changes to deploy */
  hasPendingChanges: boolean;
  /** Dismiss the pending changes notification */
  dismissPendingChanges: () => void;
}

/**
 * Hook to manage Vercel deployments with auto-deploy and persistence
 */
export function useVercelDeploy(
  threadId: string | null,
  files: Record<string, string>,
  isStreaming: boolean
): UseVercelDeployReturn {
  const [state, setState] = useState<DeployState>('idle');
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [projectName, setProjectName] = useState<string | null>(null);
  // Track deployed files for change detection
  const [deployedFilesHash, setDeployedFilesHash] = useState<string | null>(null);
  const [changedFilesSinceDeploy, setChangedFilesSinceDeploy] = useState<string[]>([]);
  const [pendingChangesDismissed, setPendingChangesDismissed] = useState(false);

  const deploymentIdRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoDeployTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFilesRef = useRef<Record<string, string> | null>(null);
  const lastFilesHashRef = useRef<string>('');
  const deployFnRef = useRef<(files: Record<string, string>, name?: string) => Promise<void>>();
  // Store snapshot of deployed files
  const deployedFilesSnapshot = useRef<Record<string, string>>({});

  const isConfigured = isVercelConfigured();

  // Generate a simple hash for files to detect changes
  const getFilesHash = (f: Record<string, string>) => {
    return Object.keys(f).sort().join('|') + '|' + Object.values(f).map(v => v.length).join('|');
  };

  // Load stored deployment on mount
  useEffect(() => {
    if (!threadId) return;

    const stored = localStorage.getItem(`${STORAGE_PREFIX}${threadId}`);
    if (stored) {
      try {
        const data: StoredDeployment = JSON.parse(stored);
        setDeploymentUrl(data.url);
        setProjectName(data.projectName);
        setState('ready');
      } catch {
        // Invalid stored data, ignore
      }
    }
  }, [threadId]);

  // Save deployment when URL changes
  const saveDeployment = useCallback((url: string, name: string) => {
    if (!threadId) return;

    const data: StoredDeployment = {
      url,
      projectName: name,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${threadId}`, JSON.stringify(data));
  }, [threadId]);

  // Clear countdown and timeout
  const clearTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoDeployTimeoutRef.current) {
      clearTimeout(autoDeployTimeoutRef.current);
      autoDeployTimeoutRef.current = null;
    }
    setCountdown(0);
  }, []);

  const handleStatusUpdate = useCallback((status: DeploymentStatus) => {
    deploymentIdRef.current = status.id;

    switch (status.readyState) {
      case 'QUEUED':
        setState('preparing');
        break;
      case 'BUILDING':
        setState('building');
        break;
      case 'READY':
        setState('ready');
        const url = normalizeUrl(status.url);
        setDeploymentUrl(url);
        if (projectName) {
          saveDeployment(url, projectName);
        }
        break;
      case 'ERROR':
      case 'CANCELED':
        // Just update state - let waitForDeployment handle the error
        // with full build logs
        setState('error');
        break;
    }
  }, [projectName, saveDeployment]);

  const deploy = useCallback(
    async (filesToDeploy: Record<string, string>, name?: string) => {
      if (!isConfigured) {
        setError('Vercel API token not configured');
        setState('error');
        return;
      }

      if (Object.keys(filesToDeploy).length === 0) {
        setError('No files to deploy');
        setState('error');
        return;
      }

      clearTimers();

      // Reset state
      setError(null);
      setState('preparing');

      try {
        // Generate project name if not provided
        const deployName = name || projectName || `preview-${Date.now()}`;
        setProjectName(deployName);

        // Start deployment
        setState('deploying');
        const finalStatus = await deployToVercel(filesToDeploy, deployName, handleStatusUpdate);

        // Set final URL (alias is now created by deployToVercel)
        const finalUrl = normalizeUrl(finalStatus.url);
        setDeploymentUrl(finalUrl);
        saveDeployment(finalUrl, deployName);
        setState('ready');

        // Save deployed files snapshot for change tracking
        deployedFilesSnapshot.current = { ...filesToDeploy };
        setDeployedFilesHash(getFilesHash(filesToDeploy));
        setChangedFilesSinceDeploy([]);
        setPendingChangesDismissed(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Deployment failed';
        setError(message);
        setState('error');
      }
    },
    [isConfigured, handleStatusUpdate, clearTimers, projectName, saveDeployment]
  );

  // Keep deploy ref up to date
  deployFnRef.current = deploy;

  // Start countdown for auto-deploy
  const startCountdown = useCallback((filesToDeploy: Record<string, string>) => {
    clearTimers();
    pendingFilesRef.current = filesToDeploy;
    setCountdown(AUTO_DEPLOY_DELAY);
    setState('waiting');

    // Update countdown every second
    let remaining = AUTO_DEPLOY_DELAY;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearTimers();
        if (pendingFilesRef.current && deployFnRef.current) {
          // Use ref to get the current deploy function (avoids stale closure)
          deployFnRef.current(pendingFilesRef.current);
          pendingFilesRef.current = null;
        }
      }
    }, 1000);
  }, [clearTimers]);

  // Cancel auto-deploy
  const cancelAutoDeploy = useCallback(() => {
    clearTimers();
    pendingFilesRef.current = null;
    // Go back to ready if we have a URL, otherwise idle
    setState(deploymentUrl ? 'ready' : 'idle');
  }, [clearTimers, deploymentUrl]);

  // Deploy now (skip countdown)
  const deployNow = useCallback(() => {
    clearTimers();
    const filesToDeploy = pendingFilesRef.current || files;
    pendingFilesRef.current = null;
    deploy(filesToDeploy);
  }, [clearTimers, files, deploy]);

  // Auto-deploy when files change (after streaming ends)
  useEffect(() => {
    // Don't auto-deploy if not configured or streaming
    if (!isConfigured || isStreaming) return;

    // Don't auto-deploy if no files
    const fileCount = Object.keys(files).length;
    if (fileCount === 0) return;

    // Only auto-deploy if project has required files (package.json + .tsx/.jsx)
    if (!isProjectComplete(files)) return;

    // Check if files actually changed
    const currentHash = getFilesHash(files);
    if (currentHash === lastFilesHashRef.current) return;
    lastFilesHashRef.current = currentHash;

    // Don't start countdown if already deploying
    if (state === 'preparing' || state === 'deploying' || state === 'building') return;

    // Start countdown for auto-deploy
    startCountdown(files);
  }, [files, isStreaming, isConfigured, state, startCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Detect file changes after deployment (for re-deploy notification)
  useEffect(() => {
    // Don't check during streaming or if no deployment yet
    if (isStreaming || !deployedFilesHash || state !== 'ready') {
      return;
    }

    const deployed = deployedFilesSnapshot.current;
    const changes: string[] = [];

    // Check for new or modified files
    for (const [path, content] of Object.entries(files)) {
      if (deployed[path] === undefined) {
        changes.push(path); // New file
      } else if (deployed[path] !== content) {
        changes.push(path); // Modified file
      }
    }

    // Check for deleted files
    for (const path of Object.keys(deployed)) {
      if (files[path] === undefined) {
        changes.push(path); // Deleted file
      }
    }

    setChangedFilesSinceDeploy(changes);
  }, [files, deployedFilesHash, isStreaming, state]);

  // Dismiss pending changes
  const dismissPendingChanges = useCallback(() => {
    setPendingChangesDismissed(true);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState('idle');
    setDeploymentUrl(null);
    setError(null);
    setProjectName(null);
    deploymentIdRef.current = null;
    pendingFilesRef.current = null;
    lastFilesHashRef.current = '';

    // Clear stored deployment
    if (threadId) {
      localStorage.removeItem(`${STORAGE_PREFIX}${threadId}`);
    }
  }, [clearTimers, threadId]);

  // Calculate if there are pending changes that haven't been dismissed
  const hasPendingChanges = changedFilesSinceDeploy.length > 0 && !pendingChangesDismissed;

  return {
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
    deployedFilesHash,
    changedFilesSinceDeployCount: changedFilesSinceDeploy.length,
    changedFilesSinceDeploy,
    hasPendingChanges,
    dismissPendingChanges,
  };
}
