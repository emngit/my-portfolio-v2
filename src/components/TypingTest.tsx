'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const sans = "'Roobert', sans-serif"; // same face as the section headings

const WORD_COUNT = 22;
const WORDS = [
  'function', 'const', 'return', 'array', 'string', 'object', 'class', 'import', 'export', 'async',
  'await', 'promise', 'callback', 'variable', 'boolean', 'integer', 'loop', 'index', 'query', 'select',
  'insert', 'update', 'delete', 'commit', 'branch', 'merge', 'push', 'pull', 'clone', 'debug',
  'compile', 'deploy', 'server', 'client', 'router', 'module', 'package', 'script', 'syntax', 'parser',
  'stack', 'queue', 'hash', 'tree', 'graph', 'sort', 'filter', 'reduce', 'map', 'state',
  'props', 'hook', 'render', 'event', 'token', 'cache', 'schema', 'table', 'binary', 'recursion',
];

const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

function makeText() {
  const picked: string[] = [];
  for (let i = 0; i < WORD_COUNT; i++) picked.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  return picked.join(' ');
}

/** Full-screen typing test. Mounted only after a click, so the random text can't cause a hydration mismatch. */
export default function TypingTest({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState(makeText);
  const [typed, setTyped] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [pressed, setPressed] = useState('');
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const done = typed.length === text.length;

  // Preload once; each keystroke plays a clone so rapid typing overlaps instead of cutting the sound off.
  useEffect(() => {
    clickRef.current = new Audio('/audio/mech-keyboard.mp3');
  }, []);

  const playClick = useCallback(() => {
    (clickRef.current?.cloneNode() as HTMLAudioElement | undefined)?.play().catch(() => {});
  }, []);

  const restart = useCallback(() => {
    setText(makeText());
    setTyped('');
    setElapsed(0);
    setStarted(false);
    inputRef.current?.focus();
  }, []);

  const flash = useCallback((k: string) => {
    setPressed(k.toLowerCase());
    setTimeout(() => setPressed(''), 120);
  }, []);

  const addChars = useCallback((chars: string) => {
    if (!chars) return;
    playClick();
    setTyped((prev) => {
      if (prev.length >= text.length) return prev;
      return (prev + chars).slice(0, text.length);
    });
    if (!started) {
      startRef.current = performance.now();
      setStarted(true);
    }
  }, [started, text.length, playClick]);

  // Keyboard handling. Printable keys are intercepted here; mobile keyboards (key === 'Unidentified') fall through to the hidden input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'Tab') { e.preventDefault(); restart(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        setTyped((prev) => (done ? prev : prev.slice(0, -1)));
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        flash(e.key === ' ' ? 'space' : e.key);
        if (!done) addChars(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addChars, done, flash, onClose, restart]);

  // Lock page scroll while the overlay is open and focus the hidden input (opens the on-screen keyboard on phones).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Elapsed timer: runs from the first keystroke until the text is finished.
  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 100);
    return () => clearInterval(id);
  }, [started, done]);

  // Pin the final time at the moment the last character lands.
  useEffect(() => {
    if (done && started) setElapsed((performance.now() - startRef.current) / 1000);
  }, [done, started]);

  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
  const wpm = elapsed > 0 ? Math.round(correct / 5 / (elapsed / 60)) : 0;
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const nextKey = done ? '' : text[typed.length] === ' ' ? 'space' : text[typed.length];

  const stat = (value: string, unit: string, label: string) => (
    <div style={{ textAlign: 'center', minWidth: 72 }}>
      <div style={{ fontFamily: sans, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--color-text-primary)' }}>
        {value}<span style={{ fontSize: 14, color: 'var(--color-gray-500)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginTop: 4 }}>{label}</div>
    </div>
  );

  const keyStyle = (k: string): React.CSSProperties => {
    const isNext = k === nextKey;
    const isPressed = k === pressed;
    return {
      display: 'grid', placeItems: 'center', width: 38, height: 38, fontFamily: sans, fontSize: 13,
      border: `1px solid ${isNext ? 'var(--color-purple-500)' : 'var(--color-border)'}`,
      background: isNext ? 'rgba(138,5,255,0.14)' : 'var(--color-surface)',
      color: isNext ? 'var(--color-text-primary)' : 'var(--color-gray-500)',
      transform: isPressed ? 'translateY(2px)' : 'none',
      boxShadow: isPressed ? 'none' : '0 2px 0 var(--color-border)',
      transition: 'transform .06s, background .12s, border-color .12s',
    };
  };

  const kbd: React.CSSProperties = {
    fontFamily: sans, fontSize: 11, padding: '2px 6px', border: '1px solid var(--color-border)', color: 'var(--color-gray-500)', marginRight: 6,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Typing speed test"
      onClick={() => inputRef.current?.focus()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 6.25%', overflowY: 'auto',
        background: 'color-mix(in srgb, var(--color-background) 80%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <input
        ref={inputRef}
        value=""
        onChange={(e) => { if (!done) addChars(e.target.value); e.target.value = ''; }}
        aria-label="Type the text shown on screen"
        autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close typing test"
        className="btn-render-secondary"
        style={{ position: 'absolute', top: 20, right: '6.25%', height: 36, padding: '0 14px', fontSize: 13 }}
      >
        <span>Close</span>
      </button>

      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 28 }}>
        Typing speed test
      </p>

      <div style={{ display: 'flex', gap: 'clamp(24px, 5vw, 56px)', marginBottom: 40 }}>
        {stat(String(wpm), '', 'WPM')}
        {stat(String(acc), '%', 'ACC')}
        {stat(elapsed.toFixed(1), 's', 'TIME')}
      </div>

      <div
        style={{
          width: '100%', maxWidth: 880, fontFamily: sans, fontSize: 'clamp(22px, 2.8vw, 34px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.55,
          wordBreak: 'break-word', userSelect: 'none',
        }}
      >
        {text.split('').map((ch, i) => {
          let color = 'var(--color-gray-400)';
          let bg = 'transparent';
          if (i < typed.length) {
            const ok = typed[i] === ch;
            color = ok ? 'var(--color-text-primary)' : '#ff5c5c';
            if (!ok) bg = 'rgba(255,92,92,.16)';
          }
          const caret = i === typed.length && !done;
          return (
            <span
              key={i}
              style={{ color, background: bg, opacity: i < typed.length ? 1 : 0.7, boxShadow: caret ? 'inset 2px 0 0 var(--color-purple-500)' : 'none' }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      {done ? (
        <p style={{ marginTop: 40, fontSize: 15, color: 'var(--color-text-faint)', textAlign: 'center' }}>
          Done — <strong style={{ color: 'var(--color-text-primary)' }}>{wpm} WPM</strong> at <strong style={{ color: 'var(--color-text-primary)' }}>{acc}%</strong> accuracy in {elapsed.toFixed(1)}s.
        </p>
      ) : (
        <div className="rg-typing-keys" style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {KEY_ROWS.map((row) => (
            <div key={row[0]} style={{ display: 'flex', gap: 8 }}>
              {row.map((k) => <div key={k} style={keyStyle(k)}>{k}</div>)}
            </div>
          ))}
          <div style={{ ...keyStyle('space'), width: 'min(100%, 260px)', fontSize: 10, letterSpacing: '.14em' }}>SPACE</div>
        </div>
      )}

      <div style={{ marginTop: 32, display: 'flex', gap: 24, fontFamily: sans, fontSize: 12, color: 'var(--color-gray-500)' }}>
        <span><kbd style={kbd}>tab</kbd>restart</span>
        <span><kbd style={kbd}>esc</kbd>close</span>
      </div>
    </div>
  );
}
