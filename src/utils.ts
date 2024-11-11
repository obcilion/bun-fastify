export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : `Unexpected error type: ${err}`;
}
