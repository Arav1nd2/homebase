type ApiErrorBody = {
  error: {
    message: string;
    code: string;
  };
};

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/**
 * Thin fetch wrapper for calling this app's own Route Handlers. Parses the
 * shared error shape (`{ error: { message, code } }`, Constitution
 * Principle V) on a non-2xx response. Returns `T` by assertion, not
 * runtime validation — callers MUST validate the parsed response with
 * their own Zod schema before trusting it as `T`
 * (contracts/shared-components.md).
 */
export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "unknown_error",
    );
  }

  return response.json() as Promise<T>;
}
