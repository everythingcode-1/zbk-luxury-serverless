'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = 'G-3MQD3KV6MM';
  const GA_ADS_ID = 'AW-17828596675';

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
        strategy="afterInteractive"
      />
      
      {/* Google Tag initialization */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ADS_ID}');
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false,
              transport_type: 'beacon',
              anonymize_ip: true,
              allow_google_signals: false
            });
            window.gtagSendEvent = function(url, c, e, p) {
              var cb = function() {
                if ('string' == typeof url) window.location = url;
              };
              var ev = e && e.startsWith('ads_conversion_') ? e : 'ads_conversion_' + (e || 'SUBMIT_LEAD_FORM_1');
              var ps = {'event_callback': cb, 'event_timeout': 2000};
              p && Object.assign(ps, p);
              gtag('event', ev, ps);
              return !1;
            };
          `
        }}
      />
      
      {/* Send page view after load */}
      <Script id="ga-page-view" strategy="lazyOnload">
        {`gtag('event','page_view',{page_location:window.location.href});`}
      </Script>
    </>
  );
}

