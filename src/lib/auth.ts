export type AuthField = "email" | "password" | "confirmPassword" | "code";

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address";
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Enter your password";
  if (value.length < 8) return "Use at least 8 characters";
  return undefined;
}

export function validateConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) return "Confirm your password";
  if (password !== confirmation) return "Passwords do not match";
  return undefined;
}

export function validateCode(value: string): string | undefined {
  if (!/^\d{6}$/.test(value.trim())) return "Enter the 6-digit code";
  return undefined;
}

export function getAuthError(error: unknown): string {
  const clerkError = error as {
    errors?: { longMessage?: string; message?: string }[];
    message?: string;
  };
  return (
    clerkError?.errors?.[0]?.longMessage ||
    clerkError?.errors?.[0]?.message ||
    clerkError?.message ||
    "Something went wrong. Please try again."
  );
}
