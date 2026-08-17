/**
 * Whether this visitor should be given scroll-driven movement.
 *
 * `?motion=on` overrides the preference, and exists because automated
 * browsers — the Claude Browser pane among them — report `reduce`
 * whatever the machine is set to, which leaves every scroll effect on
 * this site impossible to verify anywhere but by eye. It is opt-in
 * through the URL, so no visitor who has asked for less movement is
 * ever given more.
 */
export function motionAllowed() {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("motion") === "on") {
    return true;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
