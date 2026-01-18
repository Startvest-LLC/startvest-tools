// Google Analytics 4 event tracking utility

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __freeToolsSession?: string;
  }
}

type EventName =
  | 'cta_click'
  | 'signup_click'
  | 'paid_product_click'
  | 'tool_use'
  | 'export_click'
  | 'page_engagement';

interface EventParams {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

// IdeaLift unified analytics endpoint
const IDEALIFT_ANALYTICS = 'https://idealift.startvest.ai/api/analytics/track';
const TOOL_SLUG = 'persona-generator';

// Get or create session ID for user journey tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  if (!window.__freeToolsSession) {
    const stored = sessionStorage.getItem('freeToolsSession');
    if (stored) {
      window.__freeToolsSession = stored;
    } else {
      window.__freeToolsSession = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('freeToolsSession', window.__freeToolsSession);
    }
  }
  return window.__freeToolsSession;
}

/**
 * Send event to IdeaLift unified analytics (for funnel dashboard)
 */
function sendToIdeaLift(
  event: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  try {
    const payload = {
      event,
      app: TOOL_SLUG,
      params: {
        ...params,
        sessionId: getSessionId(),
        path: typeof window !== 'undefined' ? window.location.pathname : '/',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
    };

    fetch(IDEALIFT_ANALYTICS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track a custom event in Google Analytics 4
 */
export function trackEvent(eventName: EventName, params: EventParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: params.category || 'engagement',
      event_label: params.label,
      value: params.value,
      ...params,
    });
  }
}

/**
 * Track page view (call this on page load)
 */
export function trackPageView(): void {
  // Send to IdeaLift funnel (step 1: tool_view)
  sendToIdeaLift('tool_view');
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(action: string, destination?: string): void {
  trackEvent('cta_click', {
    action,
    category: 'cta',
    label: destination,
    destination,
  });
  // Send to IdeaLift funnel (step 3: cta_click)
  sendToIdeaLift('cta_click', { ctaId: action, destination });
}

/**
 * Track clicks to sign up / login
 */
export function trackSignupClick(source: string): void {
  trackEvent('signup_click', {
    action: 'signup_intent',
    category: 'conversion',
    label: source,
    source,
  });
}

/**
 * Track clicks to paid products (IdeaLift, etc.)
 */
export function trackPaidProductClick(product: string, source: string): void {
  trackEvent('paid_product_click', {
    action: 'paid_product_interest',
    category: 'conversion',
    label: `${product}_from_${source}`,
    product,
    source,
  });
  // Send to IdeaLift funnel (step 3: cta_click - clicking to IdeaLift is a CTA)
  if (product.toLowerCase().includes('idealift')) {
    sendToIdeaLift('cta_click', { ctaId: source, product });
  }
}

/**
 * Track tool usage (generation, calculation, etc.)
 */
export function trackToolUse(toolName: string, action: string, metadata?: Record<string, string | number>): void {
  trackEvent('tool_use', {
    action,
    category: 'tool_usage',
    label: toolName,
    tool_name: toolName,
    ...metadata,
  });
  // Send to IdeaLift funnel (step 2: tool_use)
  sendToIdeaLift('tool_use', { action, ...metadata });
}

/**
 * Track exports/downloads
 */
export function trackExport(format: string, source: string): void {
  trackEvent('export_click', {
    action: 'export',
    category: 'engagement',
    label: `${format}_from_${source}`,
    format,
    source,
  });
  // Send to IdeaLift funnel (step 2: tool_use - export is a form of usage)
  sendToIdeaLift('tool_use', { action: 'export', format });
}
