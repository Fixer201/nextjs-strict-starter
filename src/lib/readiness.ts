export interface ReadinessProbe {
  check(): Promise<void>
}

export type ReadinessResult =
  | { readonly cause: unknown; readonly status: 'unavailable' }
  | { readonly status: 'ready' }

export async function checkReadiness(probe: ReadinessProbe): Promise<ReadinessResult> {
  try {
    await probe.check()
    return { status: 'ready' }
  } catch (error: unknown) {
    return { cause: error, status: 'unavailable' }
  }
}
