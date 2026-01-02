---
name: data-fetching
description: Data fetching with TanStack Query, loading states, and error handling
---

# Data Fetching Patterns

## 1. Basic Query with TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

// API functions
async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

async function updateUser(user: Partial<User> & { id: string }): Promise<User> {
  const res = await fetch(`/api/users/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

// Component
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <UserSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 2. Mutations with Optimistic Updates

```tsx
function UserEditor({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUser,
    // Optimistic update
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user", userId] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(["user", userId]);

      // Optimistically update
      queryClient.setQueryData<User>(["user", userId], (old) => ({
        ...old!,
        ...newUser,
      }));

      return { previousUser };
    },
    // Rollback on error
    onError: (err, newUser, context) => {
      queryClient.setQueryData(["user", userId], context?.previousUser);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ id: userId, name: "New Name" });
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save"}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
    </form>
  );
}
```

## 3. Infinite Scroll / Pagination

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

interface Page {
  items: Item[];
  nextCursor?: string;
}

function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["items"],
    queryFn: ({ pageParam }) => fetchItems(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

## 4. Dependent Queries

```tsx
function UserPosts({ userId }: { userId: string }) {
  // First query
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  // Dependent query - only runs when user is available
  const { data: posts } = useQuery({
    queryKey: ["posts", user?.id],
    queryFn: () => fetchUserPosts(user!.id),
    enabled: !!user, // Only run when user exists
  });

  return (
    <div>
      <h1>{user?.name}'s Posts</h1>
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

## 5. Prefetching

```tsx
function UserList() {
  const queryClient = useQueryClient();

  return (
    <ul>
      {users.map((user) => (
        <li
          key={user.id}
          // Prefetch on hover
          onMouseEnter={() => {
            queryClient.prefetchQuery({
              queryKey: ["user", user.id],
              queryFn: () => fetchUser(user.id),
              staleTime: 5 * 60 * 1000, // 5 minutes
            });
          }}
        >
          <Link href={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

## 6. Loading & Error States

```tsx
// Skeleton component
function UserSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-32 bg-muted rounded mt-2" />
    </div>
  );
}

// Error component with retry
function ErrorMessage({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-600 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Usage with error boundary
function DataContainer({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    retry: 2,
  });

  if (isLoading) return <UserSkeleton />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;

  return <UserProfile user={data} />;
}
```

## 7. Server Components (Next.js 14+)

```tsx
// app/users/[id]/page.tsx
async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);

  return (
    <div>
      <h1>{user.name}</h1>
      {/* Client component for interactive features */}
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={user.id} />
      </Suspense>
    </div>
  );
}

// Revalidation
export const revalidate = 60; // Revalidate every 60 seconds
```

## Query Key Patterns

```tsx
// Hierarchical keys for proper invalidation
const queryKeys = {
  all: ["users"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters: Filters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Usage
useQuery({ queryKey: queryKeys.detail(userId), ... });

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.all });

// Invalidate only lists
queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
```

## Best Practices

1. **Always handle** loading, error, and success states
2. **Use staleTime** to reduce unnecessary refetches
3. **Prefetch** on hover for better UX
4. **Optimistic updates** for instant feedback
5. **Hierarchical query keys** for granular invalidation
6. **Error boundaries** for unhandled errors
