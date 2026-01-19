export interface RunwayState {
  cashBalance: string;
  monthlyBurn: string;
  monthlyRevenue: string;
  burnGrowthRate: string;
  revenueGrowthRate: string;
  projectionMonths: string;
}

/**
 * Encode state to URL-safe string (base64 compressed)
 */
export function encodeRunwayState(state: RunwayState): string {
  const json = JSON.stringify({
    c: state.cashBalance,
    b: state.monthlyBurn,
    r: state.monthlyRevenue,
    bg: state.burnGrowthRate,
    rg: state.revenueGrowthRate,
    p: state.projectionMonths,
  });
  return btoa(json);
}

/**
 * Decode state from URL parameter
 */
export function decodeRunwayState(encoded: string): RunwayState | null {
  try {
    const json = atob(encoded);
    const data = JSON.parse(json);
    return {
      cashBalance: data.c || '500000',
      monthlyBurn: data.b || '50000',
      monthlyRevenue: data.r || '10000',
      burnGrowthRate: data.bg || '2',
      revenueGrowthRate: data.rg || '10',
      projectionMonths: data.p || '24',
    };
  } catch {
    return null;
  }
}

/**
 * Generate shareable URL with state
 */
export function generateShareableUrl(state: RunwayState): string {
  const encoded = encodeRunwayState(state);
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://runway.tools.startvest.ai';
  return `${baseUrl}?s=${encoded}`;
}
