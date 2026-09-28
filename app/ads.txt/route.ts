import { ADSENSE_CLIENT, adsEnabled } from "@/lib/site-config";

export const dynamic = "force-static";

// f08c47fec0942fa0 is Google's certification authority ID for ads.txt.
export function GET() {
  const body = adsEnabled ? `google.com, ${ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` : "# No authorized ad sellers yet.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
