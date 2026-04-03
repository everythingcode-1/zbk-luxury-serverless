/**
 * Google Ads Conversion Tracking Utilities
 * 
 * Helper functions for tracking Google Ads conversions
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Helper function to delay opening a URL until a gtag event is sent.
 * Call it in response to an action that should navigate to a URL.
 * 
 * @param url - URL to navigate to after conversion event is sent
 * @param conversionLabel - Google Ads conversion label (e.g., 'ads_conversion_SUBMIT_LEAD_FORM_1')
 * @param eventParams - Additional event parameters (value, currency, transaction_id, etc.)
 * @returns false to prevent default navigation
 */
export function gtagSendEvent(
  url: string,
  conversionLabel: string,
  eventParams?: {
    value?: number;
    currency?: string;
    transaction_id?: string;
    [key: string]: any;
  }
): boolean {
  if (typeof window === 'undefined' || !window.gtag) {
    // If gtag is not available, navigate immediately
    console.warn('gtag not available, navigating without conversion tracking');
    if (typeof url === 'string') {
      window.location.href = url;
    }
    return false;
  }

  const callback = function () {
    if (typeof url === 'string') {
      window.location.href = url;
    }
  };

  const eventName = conversionLabel.startsWith('ads_conversion_')
    ? conversionLabel
    : `ads_conversion_${conversionLabel}`;

  const params: any = {
    'event_callback': callback,
    'event_timeout': 2000,
    ...eventParams,
  };

  window.gtag('event', eventName, params);
  return false;
}

/**
 * Track conversion event without navigation
 * Use this for tracking conversions on the same page (e.g., thank you page)
 * 
 * @param conversionLabel - Google Ads conversion label
 * @param eventParams - Additional event parameters
 */
export function gtagTrackConversion(
  conversionLabel: string,
  eventParams?: {
    value?: number;
    currency?: string;
    transaction_id?: string;
    [key: string]: any;
  }
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('gtag not available');
    return;
  }

  const eventName = conversionLabel.startsWith('ads_conversion_')
    ? conversionLabel
    : `ads_conversion_${conversionLabel}`;

  window.gtag('event', eventName, eventParams || {});
}

/**
 * Standard conversion labels for ZBK Limousine Tours
 */
export const CONVERSION_LABELS = {
  SUBMIT_LEAD_FORM: 'ads_conversion_SUBMIT_LEAD_FORM_1',
  BOOKING_COMPLETED: 'ads_conversion_BOOKING_COMPLETED',
  PHONE_CALL: 'ads_conversion_PHONE_CALL',
  CONTACT_FORM: 'ads_conversion_CONTACT_FORM',
} as const;



