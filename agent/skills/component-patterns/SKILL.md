---
name: component-patterns
description: React component patterns for reusable, maintainable code
---

# Component Patterns

## 1. Compound Components

Use for related components with shared implicit state (Tabs, Accordion, Menu, Select).

```tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("useTabs must be used within Tabs");
  return context;
}

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
}

Tabs.List = function TabsList({ children }: TabsListProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

Tabs.Trigger = function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { value: selected, onChange } = useTabs();
  const isSelected = value === selected;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange(value)}
      className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
        isSelected
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
}

Tabs.Content = function TabsContent({ value, children }: TabsContentProps) {
  const { value: selected } = useTabs();
  if (value !== selected) return null;

  return (
    <div role="tabpanel" className="py-4">
      {children}
    </div>
  );
};
```

**Usage:**
```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>
```

## 2. Custom Hooks

Extract reusable stateful logic.

```tsx
// useToggle - Boolean state with helpers
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse } as const;
}

// useDebounce - Debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// useLocalStorage - Persisted state
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}

// useMediaQuery - Responsive breakpoints
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
```

## 3. Render Props

For maximum flexibility in rendered output (rare with hooks, but useful).

```tsx
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return <>{render(position)}</>;
}

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse: {x}, {y}</div>
  )}
/>
```

## 4. Polymorphic Components

Components that can render as different elements.

```tsx
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicProps<C extends React.ElementType, Props = {}> =
  React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

interface ButtonOwnProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

type ButtonProps<C extends React.ElementType = "button"> = PolymorphicProps<C, ButtonOwnProps>;

function Button<C extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps<C>) {
  const Component = as || "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage
<Button>Click me</Button>
<Button as="a" href="/link">Link button</Button>
<Button as={Link} to="/route">Router link</Button>
```

## When to Use Each

| Pattern | Use Case |
|---------|----------|
| **Compound** | Related components sharing implicit state |
| **Custom Hooks** | Reusable stateful logic across components |
| **Render Props** | Full control over rendered output |
| **Polymorphic** | Components that should render as different elements |
