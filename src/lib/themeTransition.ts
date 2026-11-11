/**
 * "Sword slash" theme switch.
 *
 * A glowing diagonal blade sweeps left → right across the screen. The NEW theme is revealed
 * behind the blade's edge (clip-path), as if the old theme were being cut open.
 * Uses the View Transitions API; browsers without it (or users who prefer reduced motion)
 * get an instant switch.
 */

interface ViewTransitionLike { ready: Promise<void>; finished: Promise<void> }
type DocWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

const DURATION = 750;
const EASING = 'cubic-bezier(.7, 0, .25, 1)';

export function swordThemeTransition(update: () => void) {
  const doc = document as DocWithViewTransition;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc.startViewTransition || reduceMotion) {
    update();
    return;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const slant = Math.round(W * 0.35);                 // horizontal run of the cut over the full height
  const angle = Math.atan2(slant, H);                 // blade tilt (clockwise → bottom leans left)
  const travel = W + slant;                           // distance the top of the blade moves

  const blade = document.createElement('div');
  blade.className = 'sword-slash';
  blade.style.height = `${Math.hypot(slant, H) + 4}px`;

  const transition = doc.startViewTransition(() => {
    document.body.appendChild(blade);
    update();
  });

  transition.ready.then(() => {
    // reveal the new theme behind the blade's slanted edge
    document.documentElement.animate(
      {
        clipPath: [
          `polygon(0px 0px, 0px 0px, ${-slant}px ${H}px, 0px ${H}px)`,
          `polygon(0px 0px, ${travel}px 0px, ${W}px ${H}px, 0px ${H}px)`,
        ],
      },
      { duration: DURATION, easing: EASING, fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
    );
    // move the blade along that same edge
    document.documentElement.animate(
      {
        transformOrigin: ['0 0', '0 0'],
        transform: [
          `translateX(0px) rotate(${angle}rad)`,
          `translateX(${travel}px) rotate(${angle}rad)`,
        ],
      },
      { duration: DURATION, easing: EASING, fill: 'forwards', pseudoElement: '::view-transition-group(sword)' },
    );
  }).catch(() => { /* transition skipped — theme is already applied */ });

  transition.finished.finally(() => blade.remove());
}
