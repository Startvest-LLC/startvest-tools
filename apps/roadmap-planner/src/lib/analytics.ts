// Google Analytics 4 + Backend event tracking utility

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

// Backend API URL for analytics
const ANALYTICS_API = process.env.NEXT_PUBLIC_ANALYTICS_API || 'https://idealift.io/api/free-tools/track';

// IdeaLift unified analytics endpoint
const IDEALIFT_ANALYTICS = 'https://idealift.startvest.ai/api/analytics/track';
const TOOL_SLUG = 'roadmap-planner';

// Get or create session ID for user journey tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  if (!window.__freeToolsSession) {
    // Check sessionStorage first
    const stored = sessionStorage.getItem('freeToolsSession');
    if (stored) {
      window.__freeToolsSession = stored;
    } else {
      // Generate new session ID
      window.__freeToolsSession = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('freeToolsSession', window.__freeToolsSession);
    }
  }
  return window.__freeToolsSession;
}

// Get current tool name from environment or pathname
function getToolName(): string {
  if (typeof window === 'undefined') return 'unknown';

  // Try to get from env first (set in each app's .env)
  const envTool = process.env.NEXT_PUBLIC_TOOL_NAME;
  if (envTool) return envTool;

  // Fallback: extract from hostname
  const hostname = window.location.hostname;
  if (hostname.includes('demoforge')) return 'demoforge';
  if (hostname.includes('changelog')) return 'changelog_generator';
  if (hostname.includes('pitchdeck')) return 'pitchdeck_ai';
  if (hostname.includes('demo-script')) return 'demo_script_generator';
  if (hostname.includes('feature-prioritizer')) return 'feature_prioritizer';
  if (hostname.includes('release-notes')) return 'release_notes_generator';
  if (hostname.includes('prd-generator')) return 'prd_generator';
  if (hostname.includes('runway')) return 'runway_calculator';
  if (hostname.includes('widget')) return 'widget_generator';
  if (hostname.includes('discord')) return 'discord_health_checker';
  if (hostname.includes('issue-tracker')) return 'issue_tracker';
  if (hostname.includes('statuspage')) return 'statuspage_generator';

  return 'unknown';
}

/**
 * Send event to backend API (non-blocking)
 */
async function sendToBackend(
  eventType: string,
  action: string,
  metadata?: Record<string, string | number | boolean | undefined>
): Promise<void> {
  try {
    const payload = {
      eventType,
      toolName: getToolName(),
      action,
      sessionId: getSessionId(),
      metadata: metadata || {},
    };

    // Use sendBeacon for reliability (won't be cancelled on page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_API, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(ANALYTICS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently fail - tracking should never break the app
      });
    }
  } catch {
    // Silently fail
  }
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
  // GA4 handles page views automatically with gtag config
  // Send to backend
  sendToBackend('page_view', 'view');
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

  // Send to backend
  sendToBackend('signup_click', 'signup_intent', { source });
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

  // Send to backend
  sendToBackend('paid_product_click', 'paid_product_interest', { product, source });
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

  // Send to backend
  sendToBackend('tool_use', action, { tool_name: toolName, ...metadata });
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

  // Send to backend
  sendToBackend('export_click', 'export', { format, source });
  // Send to IdeaLift funnel (step 2: tool_use - export is a form of usage)
  sendToIdeaLift('tool_use', { action: 'export', format });
}