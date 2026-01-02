---
name: form-patterns
description: Form handling with React Hook Form and Zod validation
---

# Form Patterns

## 1. Basic Form with Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          id="password"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
```

## 2. Complex Schema Validation

```tsx
const userSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  age: z.number().min(18, "Must be 18 or older").max(120),

  // Optional with default
  newsletter: z.boolean().default(false),

  // Enum
  role: z.enum(["user", "admin", "moderator"]),

  // Nested object
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  }),

  // Array
  tags: z.array(z.string()).min(1, "Add at least one tag"),

  // Conditional validation
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## 3. Reusable Form Field Component

```tsx
import { useFormContext, FieldPath, FieldValues } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        id={name}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border px-3 py-2",
          error && "border-red-500 focus:ring-red-500"
        )}
      />
      {error && (
        <p className="text-sm text-red-600">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Usage with FormProvider
function MyForm() {
  const methods = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormField name="email" label="Email" type="email" />
        <FormField name="password" label="Password" type="password" />
      </form>
    </FormProvider>
  );
}
```

## 4. Dynamic Form Fields (Array)

```tsx
import { useFieldArray, useForm } from "react-hook-form";

const schema = z.object({
  users: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
  })).min(1),
});

type FormData = z.infer<typeof schema>;

function DynamicForm() {
  const { control, register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      users: [{ name: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4">
          <input {...register(`users.${index}.name`)} placeholder="Name" />
          <input {...register(`users.${index}.email`)} placeholder="Email" />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: "", email: "" })}>
        Add User
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## 5. Form with File Upload

```tsx
const schema = z.object({
  name: z.string().min(1),
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Avatar is required")
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      "File must be less than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files[0]?.type),
      "Only JPEG or PNG allowed"
    ),
});

function FileUploadForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const avatar = watch("avatar");
  const preview = avatar?.[0] ? URL.createObjectURL(avatar[0]) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />

      <div>
        <input
          {...register("avatar")}
          type="file"
          accept="image/jpeg,image/png"
        />
        {preview && <img src={preview} alt="Preview" className="w-20 h-20" />}
        {errors.avatar && <p>{errors.avatar.message}</p>}
      </div>

      <button type="submit">Upload</button>
    </form>
  );
}
```

## 6. Server Actions (Next.js)

```tsx
// actions.ts
"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function subscribeAction(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await subscribeToNewsletter(result.data.email);
  return { success: true };
}

// Component
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Subscribing..." : "Subscribe"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeAction, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      {state?.error?.email && <p>{state.error.email}</p>}
      {state?.success && <p>Subscribed!</p>}
      <SubmitButton />
    </form>
  );
}
```

## Best Practices

1. **Always use Zod** for schema validation
2. **Show errors inline** next to the field
3. **Disable submit** while submitting
4. **Use `FormProvider`** for deep nesting
5. **Debounce** async validation (username availability)
6. **Reset form** after successful submission
