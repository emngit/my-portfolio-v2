'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import AuroraRaw from './Aurora';

// Aurora.jsx is plain JS, so TS infers every defaulted prop as required - declare the ones we use.
const Aurora = AuroraRaw as ComponentType<{
  colorStops?: string[]; amplitude?: number; blend?: number; height?: number;
  speed?: number; glow?: number; lightMode?: boolean; dpr?: number;
}>;

// Dark: purple. Light: portal greens — saturated enough to contrast with the dark text.
const DARK_STOPS = ['#9d7df5', '#5227ff', '#5227ff'];
const LIGHT_STOPS = ['#4ade80', '#16a34a', '#84cc16'];

/** Page-wide fixed Aurora backdrop (sits behind all content). Follows the site's dark/light theme. */
export default function AuroraBackground() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsLight(root.getAttribute('data-theme') === 'light');
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Aurora
        colorStops={isLight ? LIGHT_STOPS : DARK_STOPS}
        amplitude={1}
        blend={0.5}
        height={0.45}
        speed={1}
        glow={0.6}
        lightMode={isLight}
        dpr={1}
      />
    </div>
  );
}

