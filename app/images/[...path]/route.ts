import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function labelFromPath(path: string[]) {
  const last = path[path.length - 1] ?? "image";
  const base = last.replace(/\.(jpg|jpeg|png|webp|svg)$/i, "");
  // e.g. trouser-1 => Trouser 1
  const pretty = base.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return pretty || "CLORY WEARS";
}

export async function GET(_req: Request, ctx: { params: { path: string[] } }) {
  const label = labelFromPath(ctx.params.path ?? []);
  const sub = "Upload your image to public/images to replace this placeholder.";

  // 800x1000 clean product placeholder (matches shop/product layouts)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C2185B" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="#E91E63" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C2185B"/>
      <stop offset="100%" stop-color="#E91E63"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#C2185B" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect x="0" y="0" width="800" height="1000" fill="url(#g)"/>

  <g filter="url(#soft)">
    <rect x="70" y="90" width="660" height="820" rx="34" fill="#FFFFFF" fill-opacity="0.80" stroke="#C2185B" stroke-opacity="0.18"/>
  </g>

  <circle cx="120" cy="140" r="10" fill="url(#brand)"/>
  <text x="145" y="148" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="22" font-weight="900" fill="#1B1B1B">CLORY</text>
  <text x="222" y="148" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="22" font-weight="900" fill="#C2185B">WEARS</text>

  <text x="100" y="300" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="46" font-weight="950" letter-spacing="-1.2" fill="#1B1B1B">${escapeXml(label)}</text>

  <text x="100" y="350" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="18" font-weight="700" fill="rgba(27,27,27,0.70)">${escapeXml(sub)}</text>

  <g opacity="0.9">
    <rect x="100" y="430" width="600" height="330" rx="26" fill="rgba(233,30,99,0.06)" stroke="rgba(233,30,99,0.20)"/>
    <path d="M235 645l92-110 88 98 64-76 126 154H235z"
          fill="rgba(194,24,91,0.22)"/>
    <circle cx="292" cy="535" r="22" fill="rgba(233,30,99,0.35)"/>
  </g>

  <text x="100" y="830" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="16" font-weight="800" fill="rgba(27,27,27,0.65)">
    Expected file: /public/images/${escapeXml(ctx.params.path?.[ctx.params.path.length - 1] ?? "")}
  </text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      // Works even if the URL ends with .jpg; the browser uses the response content-type
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}