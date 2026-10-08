/** Simulated network latency for mock services. */
export const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));

/** Flag surfaced in UI wherever a mock service is answering. */
export const MOCK_SERVICES = true;
