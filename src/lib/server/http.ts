/** Small helpers shared by the browser-facing provider proxy routes. */

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
  // The bookmarklet runs on arbitrary HTTPS pages and calls the local proxy.
  // Chromium treats that as a public-to-local network request.
  "Access-Control-Allow-Private-Network": "true",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin, Access-Control-Request-Headers, Access-Control-Request-Private-Network",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}
