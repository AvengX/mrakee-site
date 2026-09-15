/* ================================================================
   Enquiry delivery service via Web3Forms.

   THE KEY NEVER LEAVES THE SERVER.
   The access key is read from process.env.WEB3FORMS_ACCESS_KEY and is
   never bundled into client assets or exposed to the browser.

   Limits protect the endpoint:
   - Same-origin verification
   - Per-IP rate limiting
   - Honeypot trap check for bots
   - Input validation before forwarding to Web3Forms
   ================================================================ */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5; // 5 enquiries per minute per IP is ample for human visitors

const buckets = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 500) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > WINDOW_MS) buckets.delete(k);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // Same-origin verification. Permitted in dev (localhost) or when origin matches host.
  const origin = req.headers.origin || "";
  const host = req.headers.host || "";
  if (origin && !origin.includes(host) && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    return res.status(403).json({ error: "Cross-origin requests are not accepted." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(429).json({
      error: "Too many enquiries submitted. Please wait a moment before trying again.",
    });
  }

  // Honeypot trap: if a bot filled in the hidden website field, silently accept
  // without forwarding to Web3Forms.
  if (req.body?.website) {
    return res.status(200).json({
      success: true,
      message: "Enquiry received successfully.",
    });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    return res.status(503).json({
      error: "The contact form is not configured yet.",
      detail: "WEB3FORMS_ACCESS_KEY is not set in the environment.",
    });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  const company = String(req.body?.company || "").trim();
  const phone = String(req.body?.phoneFormatted || req.body?.phone || "").trim();
  const country = String(req.body?.country || "").trim();
  const city = String(req.body?.city || "").trim();
  const projectType = String(req.body?.projectType || "").trim();

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (message.length < 10) {
    return res.status(400).json({ error: "Please enter a message of at least 10 characters." });
  }

  const subject = name
    ? `New MR AKEE Website Enquiry from ${name}${company ? ` (${company})` : ""}`
    : "New MR AKEE Website Enquiry";

  const web3formsPayload = {
    access_key: accessKey,
    subject,
    from_name: name ? `${name} via MR AKEE` : "MR AKEE Website",
    replyto: email,
    name,
    email,
    company: company || "—",
    phone: phone || "—",
    country: country || "—",
    city: city || "—",
    project_type: projectType || "—",
    message,
  };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(web3formsPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Web3Forms error:", data);
      return res.status(response.status >= 400 ? response.status : 400).json({
        error: data.message || "Failed to submit enquiry via email service.",
      });
    }

    return res.status(200).json({
      success: true,
      message: data.message || "Enquiry submitted successfully.",
    });
  } catch (err) {
    console.error("Enquiry submission exception:", err);
    return res.status(500).json({
      error: "An unexpected error occurred while sending your enquiry.",
      detail: err.message,
    });
  }
}
