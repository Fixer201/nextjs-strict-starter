export interface ReadinessProbe {
  check(): Promise<void>
}

export type ReadinessResult =
  | { readonly cause: unknown; readonly status: 'unavailable' }
  | { readonly status: 'ready' }

/**
 * Runs a readiness probe without leaking its failure to callers as an exception.
 *
 * @param probe - Dependency check to execute.
 * @returns A ready result or an unavailable result retaining the internal cause for logging.
 */
export async function checkReadiness(probe: ReadinessProbe): Promise<ReadinessResult> {
  try {
    await probe.check()
    return { status: 'ready' }
  } catch (error: unknown) {
    return { cause: error, status: 'unavailable' }
  }
}
