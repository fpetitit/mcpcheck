import https from "node:https";
import type { PeerCertificate } from "node:tls";
import type { CheckResult, Finding, ScanContext } from "../mcp/types";

function fetchTlsInfo(url: URL): Promise<PeerCertificate | null> {
  return new Promise((resolve) => {
    if (url.protocol !== "https:") {
      resolve(null);
      return;
    }
    const req = https.request(
      {
        host: url.hostname,
        port: url.port || 443,
        method: "HEAD",
        path: url.pathname || "/",
        timeout: 8000,
        rejectUnauthorized: false,
      },
      (res) => {
        const socket = res.socket as import("tls").TLSSocket;
        const cert = socket.getPeerCertificate?.() ?? null;
        resolve(cert && Object.keys(cert).length > 0 ? cert : null);
        res.resume();
      },
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

async function fetchHeaders(url: URL): Promise<Headers | null> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return res.headers;
  } catch {
    return null;
  }
}

const SECURITY_HEADERS = [
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "content-security-policy",
];

export async function checkNetwork(ctx: ScanContext): Promise<CheckResult> {
  const findings: Finding[] = [];
  const [cert, headers] = await Promise.all([fetchTlsInfo(ctx.url), fetchHeaders(ctx.url)]);

  if (ctx.url.protocol === "https:") {
    if (!cert) {
      findings.push({
        severity: "medium",
        title: "Could not retrieve TLS certificate details",
        detail: "The server may not support a plain HTTPS HEAD request on this path.",
      });
    } else {
      const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
      if (validTo && validTo.getTime() < Date.now()) {
        findings.push({
          severity: "critical",
          title: "TLS certificate is expired",
          detail: `Certificate expired on ${validTo.toISOString()}.`,
        });
      } else if (validTo && validTo.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000) {
        findings.push({
          severity: "low",
          title: "TLS certificate is expiring soon",
          detail: `Certificate expires on ${validTo.toISOString()}.`,
        });
      }
    }
  }

  const missingHeaders = SECURITY_HEADERS.filter((h) => !headers?.has(h));
  if (missingHeaders.length > 0) {
    findings.push({
      severity: "info",
      title: "Missing common HTTP security headers",
      detail: `Not set: ${missingHeaders.join(", ")}.`,
    });
  }

  const corsOrigin = headers?.get("access-control-allow-origin");
  if (corsOrigin === "*") {
    findings.push({
      severity: "low",
      title: "CORS allows any origin",
      detail: 'Access-Control-Allow-Origin is set to "*", allowing any website to call this server from a browser.',
    });
  }

  return {
    id: "network",
    title: "Network & TLS",
    status: findings.some((f) => f.severity === "critical" || f.severity === "high") ? "error" : findings.length > 0 ? "warning" : "ok",
    summary:
      ctx.url.protocol === "https:"
        ? cert
          ? `TLS certificate valid until ${cert.valid_to}.`
          : "TLS details unavailable."
        : "Plain HTTP, no TLS certificate to inspect.",
    data: {
      certificate: cert
        ? {
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
          }
        : null,
      headers: headers ? Object.fromEntries(headers.entries()) : null,
    },
    findings,
  };
}
