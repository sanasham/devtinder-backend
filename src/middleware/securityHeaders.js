// middleware/securityHeaders.js
module.exports = (req, res, next) => {
  const headers = {
    // === Security Headers ===

    // Forces JSON responses and helps prevent MIME type sniffing.
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff', // Prevents browsers from MIME-sniffing content.
    'X-Download-Options': 'noopen', // Prevents Internet Explorer from executing downloads in the site's context.
    'X-XSS-Protection': '1; mode=block', // Enables XSS filtering in older browsers.
    'X-Frame-Options': 'DENY', // Blocks the site from being embedded in iframes (prevents clickjacking).
    'Referrer-Policy': 'no-referrer', // Hides the Referer header entirely.
    'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()', // Restricts browser features.
    'Feature-Policy': "geolocation 'self'; microphone 'none'; camera 'none'", // Older version of Permissions-Policy.
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // Forces HTTPS for 1 year.

    // Prevents loading resources from untrusted sources.
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none';",

    // Allows CSP testing without blocking content.
    'Content-Security-Policy-Report-Only': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; report-uri /csp-report-endpoint",

    // Older CSP implementations for compatibility with legacy browsers.
    'X-Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none';",
    'X-WebKit-CSP': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none';",

    // Helps detect misissued certificates.
    'Expect-CT': 'max-age=3600, enforce',

    // Cross-origin isolation security features.
    'Cross-Origin-Embedder-Policy': 'require-corp', // Ensures no untrusted cross-origin resources are loaded without CORP headers.
    'Cross-Origin-Opener-Policy': 'same-origin', // Isolates browsing contexts from other origins.
    'Cross-Origin-Resource-Policy': 'same-origin', // Restricts which origins can load this resource.

    // === CORS Headers ===

    'Access-Control-Allow-Origin': '*', // Allows any domain to access the API (be careful for sensitive APIs).
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Allowed HTTP methods.
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With', // Allowed custom headers.
    'Access-Control-Allow-Credentials': 'true', // Allows cookies/auth in cross-site requests.
    'Access-Control-Max-Age': '3600', // Caches preflight responses for 1 hour.
    'Access-Control-Allow-Private-Network': 'true', // Allows access to private networks (Chrome feature).
    'Access-Control-Expose-Headers': 'Content-Length, X-Kuma-Revalidate, X-Content-Duration, X-Content-Type-Options, X-XSS-Protection, X-Frame-Options, X-Powered-By, Content-Security-Policy, X-Content-Security-Policy, X-WebKit-CSP, X-Download-Options, X-Permitted-Cross-Domain-Policies, Cache-Control, Pragma, Expires, Content-Language, Content-Security-Policy-Report-Only, Expect-CT, Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Timing-Allow-Origin',

    // === Performance / Misc ===

    'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevents browsers from caching.
    'Pragma': 'no-cache', // Legacy HTTP 1.0 cache control.
    'Expires': '0', // Ensures cached responses are immediately stale.
    'Content-Language': 'en-US', // Specifies the language of the content.
    'X-Powered-By': 'Express', // Usually removed for security, but here it’s explicitly set.
    'X-Permitted-Cross-Domain-Policies': 'none', // Blocks Adobe Flash/Acrobat cross-domain requests.
    'Timing-Allow-Origin': '*' // Allows all domains to measure load times for resources.
  };

  // Apply headers in a loop
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
};

