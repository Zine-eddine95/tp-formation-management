/**
 * middleware/ipWhitelist.js
 *
 * Middleware de restriction d'accès par IP.
 * Supporte les adresses exactes (ex: "1.2.3.4") et les plages CIDR IPv4 (ex: "10.0.0.0/8").
 * La configuration se trouve dans config/allowed-ips.json.
 */

const allowedIpsConfig = require("../config/allowed-ips.json");

/**
 * Extrait l'IP réelle du client en tenant compte des proxies/load balancers.
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || req.ip || "";
}

/**
 * Normalise une adresse IPv4-mappée en IPv6 (::ffff:127.0.0.1 → 127.0.0.1).
 */
function normalizeIp(ip) {
  return ip.replace(/^::ffff:/, "");
}

/**
 * Vérifie si une IP correspond à une entrée (IP exacte ou CIDR IPv4).
 */
function ipMatches(ip, entry) {
  if (entry === "*") return true;

  const normalized = normalizeIp(ip);

  if (!entry.includes("/")) {
    return normalized === entry;
  }

  // Vérification CIDR
  const [range, bitsStr] = entry.split("/");
  const bits = parseInt(bitsStr, 10);

  if (bits < 0 || bits > 32) return false;

  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;

  const ipInt = normalized
    .split(".")
    .reduce((acc, oct) => ((acc << 8) | parseInt(oct, 10)) >>> 0, 0);
  const rangeInt = range
    .split(".")
    .reduce((acc, oct) => ((acc << 8) | parseInt(oct, 10)) >>> 0, 0);

  return (ipInt & mask) === (rangeInt & mask);
}

/**
 * Crée un middleware de whitelist IP pour un type d'accès donné ("api" ou "swagger").
 * @param {"api"|"swagger"} type
 */
function createIpWhitelist(type) {
  return (req, res, next) => {
    const env = process.env.NODE_ENV || "development";
    const envConfig = allowedIpsConfig[env] || allowedIpsConfig["development"];
    const allowedList = (envConfig && envConfig[type]) || ["*"];

    // Autorisation totale en développement
    if (allowedList.includes("*")) return next();

    const clientIp = getClientIp(req);
    const allowed = allowedList.some((entry) => ipMatches(clientIp, entry));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : adresse IP non autorisée.",
      });
    }

    next();
  };
}

module.exports = { createIpWhitelist };
