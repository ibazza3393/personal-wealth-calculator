/**
 * The three drifting orbs behind every page.
 *
 * This used to live inside AppShell, which meant the landing, auth and legal
 * pages could only get their background by mounting the whole app shell — and
 * with it the providers, the quotes fetch and the navigation. It is static
 * markup with no hooks, so it renders on the server and costs those pages no
 * JavaScript at all.
 */
export function GlassScene() {
  return (
    <div className="lg-scene" aria-hidden>
      <span className="lg-orb lg-orb-a" />
      <span className="lg-orb lg-orb-b" />
      <span className="lg-orb lg-orb-c" />
    </div>
  );
}
