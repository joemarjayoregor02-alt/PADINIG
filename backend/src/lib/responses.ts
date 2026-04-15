export type ApiSuccess<T> = { success: true; data: T; error: null };
export type ApiFailure = {
  success: false;
  data: null;
  error: { message: string; code?: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data, error: null };
}

export function fail(message: string, opts?: { code?: string; details?: unknown }): ApiFailure {
  return { success: false, data: null, error: { message, code: opts?.code, details: opts?.details } };
}

