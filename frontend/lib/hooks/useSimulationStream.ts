/** useSimulationStream — SSE hook for live canvas events */
// TODO: implement SSE connection to /api/stream/:id
export function useSimulationStream(simulationId: string) {
  // SSE EventSource → normalized SimulationEvents
  return { events: [], status: "idle" };
}
