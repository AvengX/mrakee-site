import * as THREE from "three";

/* ================================================================
   What the display is actually showing.

   Four slides drawn once into 2D canvases and uploaded as textures.
   Drawing them in code rather than shipping images keeps them crisp at
   any camera distance, keeps them on the brand palette by construction,
   and costs four canvases at startup instead of four network requests.

   They stay LIGHT. A commercial panel in a bright mall runs bright
   content — a dark screen here would punch a black hole through the
   middle of a light page, which is the one thing the design must not do.
   ================================================================ */

const W = 576;
const H = 1024; // 9:16, matching the panel

const INK = "#111827";
const SOFT = "#64748b";
const INDIGO = "#635bff";
const CYAN = "#06b6d4";
const VIOLET = "#8b5cf6";
const GOLD = "#d4a339";
const MINT = "#2f9d88";

function base(ctx, tint) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, tint[0]);
  g.addColorStop(1, tint[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function label(ctx, text, x, y, size, color, weight = 700, spacing = 0) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter Variable, Inter, system-ui, sans-serif`;
  ctx.textBaseline = "top";
  if (!spacing) {
    ctx.fillText(text, x, y);
    return;
  }
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---- 01 · Wayfinding ------------------------------------------- */
function slideWayfinding(ctx) {
  base(ctx, ["rgba(238,246,255,0.95)", "rgba(245,242,255,0.95)"]);

  label(ctx, "WAYFINDING", 56, 74, 22, INDIGO, 800, 5);
  label(ctx, "Level 3", 56, 118, 76, INK, 800);

  // an abstract floor plate: soft blocks with a route threaded through
  ctx.save();
  ctx.translate(56, 250);
  const cells = [
    [0, 0, 180, 120], [200, 0, 120, 120], [340, 0, 120, 190],
    [0, 140, 120, 150], [140, 140, 180, 90], [0, 310, 200, 120],
    [220, 250, 100, 180], [340, 210, 120, 220],
  ];
  cells.forEach((c, i) => {
    ctx.fillStyle = i % 3 === 0 ? "rgba(99,91,255,0.10)" : "rgba(15,23,42,0.05)";
    roundRect(ctx, c[0], c[1], c[2], c[3], 12);
    ctx.fill();
  });

  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(70, 430);
  ctx.lineTo(70, 260);
  ctx.lineTo(280, 260);
  ctx.lineTo(280, 90);
  ctx.lineTo(400, 90);
  ctx.stroke();

  ctx.fillStyle = INDIGO;
  ctx.beginPath();
  ctx.arc(70, 430, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(70, 430, 6, 0, Math.PI * 2);
  ctx.fill();

  // destination pin
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(400, 90, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const rows = [["Departures", "3 min"], ["Food Hall", "5 min"], ["Car Park B", "8 min"]];
  rows.forEach((r, i) => {
    const y = 760 + i * 82;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    roundRect(ctx, 56, y, W - 112, 64, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, r[0], 80, y + 20, 26, INK, 600);
    label(ctx, r[1], W - 80 - ctx.measureText(r[1]).width - 30, y + 21, 24, INDIGO, 700);
  });
}

/* ---- 02 · Menu board ------------------------------------------- */
function slideMenu(ctx) {
  base(ctx, ["rgba(255,251,240,0.96)", "rgba(238,249,246,0.96)"]);

  label(ctx, "ALL DAY", 56, 74, 22, GOLD, 800, 5);
  label(ctx, "Breakfast", 56, 118, 76, INK, 800);
  label(ctx, "Served until 11:00", 58, 208, 26, SOFT, 500);

  const items = [
    ["Flat White", "4.20"], ["Cold Brew", "5.00"], ["Almond Croissant", "4.80"],
    ["Big Breakfast", "14.50"], ["Avocado Toast", "12.00"],
  ];
  items.forEach((it, i) => {
    const y = 290 + i * 96;
    ctx.strokeStyle = "rgba(15,23,42,0.09)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(56, y + 78);
    ctx.lineTo(W - 56, y + 78);
    ctx.stroke();
    label(ctx, it[0], 56, y + 22, 32, INK, 600);
    const price = it[1];
    ctx.font = "700 32px Inter Variable, Inter, system-ui, sans-serif";
    label(ctx, price, W - 56 - ctx.measureText(price).width, y + 22, 32, MINT, 700);
  });

  // the "sold out" state a dayparted board actually needs
  ctx.fillStyle = "rgba(15,23,42,0.045)";
  roundRect(ctx, 44, 290 + 3 * 96 + 6, W - 88, 84, 14);
  ctx.fill();
  label(ctx, "SOLD OUT", 56, 290 + 3 * 96 + 62, 17, SOFT, 800, 3);

  ctx.fillStyle = "rgba(212,163,57,0.14)";
  roundRect(ctx, 56, 850, W - 112, 96, 20);
  ctx.fill();
  label(ctx, "Order at the kiosk", 84, 882, 30, INK, 650);
}

/* ---- 03 · Retail promotion -------------------------------------- */
function slideRetail(ctx) {
  base(ctx, ["rgba(245,242,255,0.96)", "rgba(238,246,255,0.96)"]);

  const g = ctx.createLinearGradient(56, 300, W - 56, 640);
  g.addColorStop(0, VIOLET);
  g.addColorStop(1, INDIGO);

  label(ctx, "THIS WEEK ONLY", 56, 84, 22, VIOLET, 800, 5);

  ctx.fillStyle = g;
  ctx.font = "800 236px Inter Variable, Inter, system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("30", 44, 240);
  ctx.font = "800 108px Inter Variable, Inter, system-ui, sans-serif";
  ctx.fillText("%", 380, 300);

  label(ctx, "off everything", 56, 520, 58, INK, 750);
  label(ctx, "in store and on the app", 56, 594, 28, SOFT, 500);

  // three soft product tiles
  for (let i = 0; i < 3; i++) {
    const x = 56 + i * 156;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    roundRect(ctx, x, 700, 140, 168, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = ["rgba(99,91,255,0.16)", "rgba(6,182,212,0.16)", "rgba(139,92,246,0.16)"][i];
    roundRect(ctx, x + 22, 726, 96, 96, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(15,23,42,0.14)";
    roundRect(ctx, x + 22, 838, 74, 12, 6);
    ctx.fill();
  }

  label(ctx, "Scan to shop", 56, 916, 26, INDIGO, 700);
}

/* ---- 04 · The product message ----------------------------------- */
function slideMessage(ctx) {
  base(ctx, ["rgba(255,255,255,0.97)", "rgba(247,249,252,0.97)"]);

  // the breakaway-pixel motif from the logo, oversized
  ctx.save();
  ctx.translate(W - 190, 120);
  const px = [
    [0, 0, 46, "rgba(212,163,57,0.9)"], [62, -34, 34, "rgba(212,163,57,0.6)"],
    [26, -76, 24, "rgba(230,189,95,0.5)"], [-52, 40, 30, "rgba(111,200,182,0.55)"],
  ];
  px.forEach(([x, y, s, c]) => {
    ctx.fillStyle = c;
    roundRect(ctx, x, y, s, s, s * 0.22);
    ctx.fill();
  });
  ctx.restore();

  label(ctx, "MRAKEE", 56, 96, 30, MINT, 800, 9);
  label(ctx, "TECHNOLOGIES", 58, 138, 14, GOLD, 700, 6);

  // 74px overflowed the 576px canvas on "One dashboard." and the line
  // was cut off mid-word on the panel. Sized to the longest line rather
  // than eyeballed.
  ctx.font = "800 62px Inter Variable, Inter, system-ui, sans-serif";
  ctx.fillStyle = INK;
  ctx.textBaseline = "top";
  ["One estate.", "One dashboard.", "Every screen."].forEach((line, i) => {
    ctx.fillText(line, 56, 392 + i * 76);
  });

  const g = ctx.createLinearGradient(56, 640, 420, 660);
  g.addColorStop(0, GOLD);
  g.addColorStop(1, MINT);
  ctx.fillStyle = g;
  roundRect(ctx, 56, 648, 220, 8, 4);
  ctx.fill();

  label(ctx, "Digital signage, kiosks and display", 56, 706, 26, SOFT, 500);
  label(ctx, "software for Asia-Pacific.", 56, 742, 26, SOFT, 500);

  ctx.fillStyle = INK;
  roundRect(ctx, 56, 856, 260, 76, 38);
  ctx.fill();
  label(ctx, "Book a demo", 92, 880, 27, "#ffffff", 650);
}

const PAINTERS = [slideWayfinding, slideMenu, slideRetail, slideMessage];

/**
 * Build the four slide textures.
 *
 * Fonts matter here: if Inter has not loaded when these are painted the
 * canvas falls back to a system face and the textures are baked wrong
 * for the life of the page. The caller awaits document.fonts.ready
 * before calling this.
 */
export function buildScreenTextures() {
  return PAINTERS.map((paint) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    paint(ctx);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  });
}

export const SCREEN_ASPECT = W / H;
