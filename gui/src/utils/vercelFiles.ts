/**
 * Utilities for transforming agent files to Vercel-deployable format
 */

import {
  DEFAULT_PACKAGE_JSON,
  DEFAULT_TSCONFIG,
  DEFAULT_NEXT_CONFIG,
  DEFAULT_POSTCSS_CONFIG,
} from './vercelTemplates';

/**
 * Normalize file path by removing /app/ prefix
 */
export function normalizeFilePath(path: string): string {
  let normalized = path;

  // Remove /app/ prefix
  if (normalized.startsWith('/app/')) {
    normalized = normalized.slice(5);
  } else if (normalized.startsWith('/app')) {
    normalized = normalized.slice(4);
  }

  // Ensure no leading slash for Vercel (relative paths)
  if (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  return normalized;
}

/**
 * Check if a file is a configuration file
 */
function isConfigFile(path: string): boolean {
  const configFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.mjs',
    'tailwind.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'postcss.config.mjs',
  ];
  return configFiles.some((cf) => path.endsWith(cf));
}

/**
 * Prepare files for Vercel deployment
 * - Normalizes paths
 * - Adds missing configuration files
 * - Ensures required files exist
 */
export function prepareFilesForDeploy(
  files: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  // Normalize all file paths
  for (const [path, content] of Object.entries(files)) {
    const normalizedPath = normalizeFilePath(path);

    // Skip memory files
    if (path.startsWith('/memory/') || normalizedPath.startsWith('memory/')) {
      continue;
    }

    result[normalizedPath] = content;
  }

  // Add missing configuration files
  if (!result['package.json']) {
    result['package.json'] = DEFAULT_PACKAGE_JSON;
  }

  if (!result['tsconfig.json']) {
    result['tsconfig.json'] = DEFAULT_TSCONFIG;
  }

  if (!result['next.config.js'] && !result['next.config.mjs']) {
    result['next.config.js'] = DEFAULT_NEXT_CONFIG;
  }

  if (!result['postcss.config.js'] && !result['postcss.config.mjs']) {
    result['postcss.config.js'] = DEFAULT_POSTCSS_CONFIG;
  }

  return result;
}

/**
 * Get file statistics for display
 */
export function getFileStats(files: Record<string, string>): {
  totalFiles: number;
  totalSize: number;
  configFiles: number;
  sourceFiles: number;
} {
  let totalSize = 0;
  let configFiles = 0;
  let sourceFiles = 0;

  for (const [path, content] of Object.entries(files)) {
    totalSize += new Blob([content]).size;

    if (isConfigFile(path)) {
      configFiles++;
    } else {
      sourceFiles++;
    }
  }

  return {
    totalFiles: Object.keys(files).length,
    totalSize,
    configFiles,
    sourceFiles,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
