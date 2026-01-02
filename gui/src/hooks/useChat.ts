import { useCallback } from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from '@langchain/langgraph-sdk';
import { v4 as uuidv4 } from 'uuid';
import { useQueryState } from 'nuqs';
import { useClient } from '../providers/ClientProvider';
import type { TodoItem } from '../types';

export type StateType = {
  messages: Message[];
  todos: TodoItem[];
  files: Record<string, unknown>;
};

interface UseChatOptions {
  assistantId: string;
  onHistoryRevalidate?: () => void;
}

export function useChat({ assistantId, onHistoryRevalidate }: UseChatOptions) {
  const [threadId, setThreadId] = useQueryState('threadId');
  const client = useClient();

  const stream = useStream<StateType>({
    assistantId,
    client,
    reconnectOnMount: true,
    threadId: threadId ?? null,
    onThreadId: setThreadId,
    onFinish: onHistoryRevalidate,
    onError: onHistoryRevalidate,
    onCreated: onHistoryRevalidate,
    // Fetch thread history when loading existing thread (default is true with limit 10)
    fetchStateHistory: { limit: 100 },
  });

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      const newMessage: Message = {
        id: uuidv4(),
        type: 'human',
        content,
      };

      stream.submit(
        { messages: [newMessage] },
        {
          optimisticValues: (prev) => ({
            messages: [...(prev.messages ?? []), newMessage],
          }),
          config: { recursion_limit: 100 },
        }
      );

      onHistoryRevalidate?.();
    },
    [stream, onHistoryRevalidate]
  );

  const stopStream = useCallback(() => {
    stream.stop();
  }, [stream]);

  const resumeInterrupt = useCallback(
    (value: unknown) => {
      stream.submit(null, { command: { resume: value } });
      onHistoryRevalidate?.();
    },
    [stream, onHistoryRevalidate]
  );

  const markThreadAsResolved = useCallback(() => {
    stream.submit(null, { command: { goto: '__end__', update: null } });
    onHistoryRevalidate?.();
  }, [stream, onHistoryRevalidate]);

  // Switch to a different thread
  const switchThread = useCallback(
    (newThreadId: string | null) => {
      setThreadId(newThreadId);
    },
    [setThreadId]
  );

  return {
    // Stream state
    stream,
    threadId,
    setThreadId: switchThread,
    isLoading: stream.isLoading,
    isThreadLoading: stream.isThreadLoading,
    interrupt: stream.interrupt,

    // Data from stream values
    messages: stream.messages ?? [],
    todos: stream.values?.todos ?? [],
    files: stream.values?.files ?? {},

    // Actions
    sendMessage,
    stopStream,
    resumeInterrupt,
    markThreadAsResolved,
  };
}
