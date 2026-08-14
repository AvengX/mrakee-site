/* ================================================================
   One source of truth for the panel's geometry.

   The pixel field, the screen mesh and the chassis all have to agree to
   sub-millimetre precision — the whole illusion is that the pixels ARE
   the screen, and a 2mm disagreement shows up as a visible seam at the
   handoff. So none of them carry their own numbers.

   The grid is 9:16 and the cell count divides it exactly (54/96 =
   27/48 = 9/16), which makes every pixel a perfect square. Get that
   wrong and the matrix reads as slightly stretched, which looks like a
   rendering bug even when nobody can say why.
   ================================================================ */
export const PANEL = {
  screenW: 1.44,
  screenH: 2.56,

  /** bezel width around the screen on all four sides */
  bezel: 0.07,
  /** thickness of the bezel plate itself */
  bezelDepth: 0.06,

  /** how deep the chassis grows behind the front face */
  depth: 0.3,

  /** The front face of the bezel sits at z = 0 and everything grows
      backward, so the screen never moves as depth develops. */
  screenZ: 0.002,
  /** pixels float a hair in front of the screen so they never z-fight */
  pixelZ: 0.014,

  standH: 0.34,
};

/** Grid sizes by tier. Each is exactly 9:16 so cells stay square. */
export const GRID = {
  high: { cols: 54, rows: 96 }, // 5,184
  mid: { cols: 36, rows: 64 }, //  2,304
  low: { cols: 27, rows: 48 }, //  1,296
};

export const outerW = PANEL.screenW + PANEL.bezel * 2;
export const outerH = PANEL.screenH + PANEL.bezel * 2;
