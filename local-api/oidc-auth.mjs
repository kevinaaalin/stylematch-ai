import { createPublicKey, verify } from "node:crypto";

const cache = new Map();
const decode = (value) => Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="), "base64");

function unauthorized(message, code = "OIDC_TOKEN_INVALID") {
  const error = new Error(message); error.status = 401; error.code = code; throw error;
}

async function getJson(url) {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.value;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) unauthorized("OIDC metadata could not be loaded.", "OIDC_DISCOVERY_FAILED");
  const value = await response.json(); cache.set(url, { value, expires: Date.now() + 300000 }); return value;
}

export async function authenticateOidcRequest(req, { issuer, audience }) {
  if (!issuer) return null;
  const authorization = String(req.headers.authorization || "");
  if (!authorization.startsWith("Bearer ")) unauthorized("OIDC Bearer token is required.", "OIDC_TOKEN_REQUIRED");
  const token = authorization.slice(7); const parts = token.split(".");
  if (parts.length !== 3) unauthorized("OIDC token is malformed.");
  let header; let claims;
  try { header = JSON.parse(decode(parts[0])); claims = JSON.parse(decode(parts[1])); } catch { unauthorized("OIDC token payload is malformed."); }
  if (header.alg !== "RS256" || !header.kid) unauthorized("Only keyed RS256 OIDC tokens are accepted.");
  const normalizedIssuer = issuer.replace(/\/$/, "");
  const discovery = await getJson(`${normalizedIssuer}/.well-known/openid-configuration`);
  const jwks = await getJson(discovery.jwks_uri);
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) unauthorized("OIDC signing key was not found.");
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  if (!verify("RSA-SHA256", signingInput, createPublicKey({ key: jwk, format: "jwk" }), decode(parts[2]))) unauthorized("OIDC signature is invalid.");
  const epoch = Math.floor(Date.now() / 1000);
  if (claims.iss?.replace(/\/$/, "") !== normalizedIssuer) unauthorized("OIDC issuer does not match.");
  if (!claims.exp || claims.exp <= epoch || (claims.nbf && claims.nbf > epoch + 30)) unauthorized("OIDC token is expired or not active.");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (audience && !audiences.includes(audience)) unauthorized("OIDC audience does not match.");
  return claims;
}
