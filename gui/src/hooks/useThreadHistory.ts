import { useState, useEffect, useCallback } from 'react';
import { useClient } from '../providers/ClientProvider';
import type { ThreadHistoryItem } from '../components/layout/Sidebar';

interface UseThreadHistoryOptions {
  assistantId: string;
}

// Helper to extract message text content
function getMessageText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textPart = content.find((part: unknown) =>
      typeof part === 'object' && part !== null && 'text' in part
    );
    if (textPart && typeof textPart === 'object' && 'text' in textPart) {
      return String((textPart as { text: unknown }).text);
    }
  }
  return '';
}

export function useThreadHistory({ assistantId }: UseThreadHistoryOptions) {
  const client = useClient();
  const [threads, setThreads] = useState<ThreadHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if assistantId is a UUID (deployed) or graph name (local dev)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assistantId);

      const response = await client.threads.search({
        limit: 50,
        // Only filter by assistant_id metadata for deployed graphs (UUIDs)
        // Local dev graphs don't set this metadata
        ...(isUUID ? { metadata: { assistant_id: assistantId } } : {}),
      });

      const threadItems: ThreadHistoryItem[] = response.map((thread) => {
        let title = `Thread ${thread.thread_id.slice(0, 8)}...`;

        // Try to get title from thread values (messages)
        try {
          if (thread.values && typeof thread.values === 'object') {
            const values = thread.values as { messages?: Array<{ type: string; content: unknown }> };
            if (values.messages && Array.isArray(values.messages)) {
              const firstHumanMessage = values.messages.find((m) => m.type === 'human');
              if (firstHumanMessage?.content) {
                const content = getMessageText(firstHumanMessage.content);
                if (content) {
                  title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
                }
              }
            }
          }
        } catch {
          // Fallback to metadata or thread ID
          const metadata = thread.metadata as Record<string, unknown> | undefined;
          title =
            (metadata?.title as string) ||
            (metadata?.first_message as string) ||
            `Thread ${thread.thread_id.slice(0, 8)}...`;
        }

        return {
          id: thread.thread_id,
          title,
          createdAt: new Date(thread.created_at),
        };
      });

      // Sort by creation date, newest first
      threadItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setThreads(threadItems);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch thread history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch threads'));
    } finally {
      setIsLoading(false);
    }
  }, [client, assistantId]);

  // Initial fetch
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    isLoading,
    error,
    refetch: fetchThreads,
  };
}
