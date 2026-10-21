'use client';

import { useEffect, useState } from 'react';

// Color palette matching GitHub dark mode theme
const LEVEL_COLORS = [
  '#161b22', // level 0 (none)
  '#0e4429', // level 1
  '#006d32', // level 2
  '#26a641', // level 3
  '#39d353', // level 4
];

interface DayContribution {
  date?: string;
  count: number;
  level: number;
}

// Fallback 53 weeks x 7 days snapshot (183 contributions in 2026 / last year)
const FALLBACK_TOTAL = 183;
const FALLBACK_WEEKS: DayContribution[][] = Array.from({ length: 53 }, (_, col) => {
  const getCounts = (c: number): number[] => {
    switch (c) {
      case 37: return [0, 0, 0, 0, 0, 1, 0];
      case 38: return [0, 1, 0, 3, 0, 2, 0];
      case 39: return [0, 0, 2, 0, 0, 0, 0];
      case 40: return [0, 4, 0, 2, 0, 3, 0];
      case 41: return [0, 0, 3, 0, 2, 4, 0];
      case 42: return [0, 6, 2, 4, 1, 0, 0];
      case 43: return [0, 0, 4, 8, 3, 7, 0];
      case 44: return [0, 8, 10, 0, 8, 8, 0];
      case 45: return [0, 3, 0, 6, 0, 0, 0];
      case 46: return [0, 0, 0, 4, 0, 0, 0];
      case 47: return [0, 0, 0, 0, 7, 0, 0];
      case 48: return [0, 0, 5, 6, 0, 8, 0];
      case 49: return [0, 4, 0, 7, 2, 1, 0];
      case 50: return [0, 2, 0, 1, 0, 0, 0];
      case 51: return [0, 0, 0, 0, 0, 8, 0];
      case 52: return [0, 0, 0, 11, 0, 12, 0];
      default: return [0, 0, 0, 0, 0, 0, 0];
    }
  };

  const counts = getCounts(col);
  return counts.map((cnt) => {
    let lvl = 0;
    if (cnt > 0 && cnt <= 2) lvl = 1;
    else if (cnt > 2 && cnt <= 5) lvl = 2;
    else if (cnt > 5 && cnt <= 9) lvl = 3;
    else if (cnt > 9) lvl = 4;
    return { count: cnt, level: lvl };
  });
});

const DEFAULT_MONTHS = [
  { label: 'Oct', col: 0 },
  { label: 'Nov', col: 4 },
  { label: 'Dec', col: 8 },
  { label: 'Jan', col: 12 },
  { label: 'Feb', col: 17 },
  { label: 'Mar', col: 21 },
  { label: 'Apr', col: 25 },
  { label: 'May', col: 29 },
  { label: 'Jun', col: 34 },
  { label: 'Jul', col: 38 },
  { label: 'Aug', col: 42 },
  { label: 'Sep', col: 47 },
  { label: 'Oct', col: 51 },
];

const AVAILABLE_YEARS = ['2026', '2025', '2024'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function GithubContributions() {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [total, setTotal] = useState<number>(FALLBACK_TOTAL);
  const [weeks, setWeeks] = useState<DayContribution[][]>(FALLBACK_WEEKS);
  const [months, setMonths] = useState<{ label: string; col: number }[]>(DEFAULT_MONTHS);
  const [tooltip, setTooltip] = useState<{ text: string; subText?: string; x: number; y: number } | null>(null);

  useEffect(() => {
    async function fetchLiveContributions() {
      try {
        const res = await fetch('/api/contributions');
        if (!res.ok) return;
        const data = await res.json();

        if (data && Array.isArray(data.contributions) && data.contributions.length > 0) {
          const rawDays: { date: string; count: number; level: number }[] = data.contributions;
          const calculatedTotal = typeof data.total?.lastYear === 'number'
            ? data.total.lastYear
            : rawDays.reduce((acc, curr) => acc + curr.count, 0);

          setTotal(calculatedTotal);

          // Group into weeks of 7 days starting on Sunday
          const groupedWeeks: DayContribution[][] = [];
          let currentWeek: DayContribution[] = [];

          const computedMonths: { label: string; col: number }[] = [];
          let lastMonth = '';

          rawDays.forEach((item, index) => {
            const dateObj = new Date(item.date);
            const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
            const dayOfWeek = dateObj.getDay();

            if (dayOfWeek === 0 && currentWeek.length > 0) {
              groupedWeeks.push(currentWeek);
              currentWeek = [];
            }

            const currentWeekCol = groupedWeeks.length;
            if (monthName !== lastMonth) {
              computedMonths.push({ label: monthName, col: currentWeekCol });
              lastMonth = monthName;
            }

            currentWeek.push({
              date: item.date,
              count: item.count,
              level: item.level,
            });

            if (index === rawDays.length - 1 && currentWeek.length > 0) {
              groupedWeeks.push(currentWeek);
            }
          });

          if (groupedWeeks.length > 0) {
            setWeeks(groupedWeeks);
          }
          if (computedMonths.length > 0) {
            setMonths(computedMonths);
          }
        }
      } catch {
        // Silently retain fallback snapshot
      }
    }

    fetchLiveContributions();
  }, []);

  return (
    <div style={{ width: '100%', marginTop: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <a
          href="https://github.com/emngit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-purple-400)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        >
          <span>{total} contributions in {selectedYear === '2026' ? 'the last year' : selectedYear}</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="https://github.com/emngit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: 'var(--color-purple-400)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            @emngit ↗
          </a>
          <span style={{ fontSize: 12, color: 'var(--color-text-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            Contribution settings <span style={{ fontSize: 8 }}>▼</span>
          </span>
        </div>
      </div>

      {/* Main card + Year tabs layout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Heatmap Card */}
        <div
          style={{
            flex: 1,
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: '16px 18px 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            position: 'relative',
          }}
        >
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ minWidth: 630 }}>
              {/* Months row */}
              <div style={{ display: 'flex', marginLeft: 30, marginBottom: 6, position: 'relative', height: 16 }}>
                {months.map((m, idx) => (
                  <span
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${(m.col / Math.max(weeks.length, 52)) * 100}%`,
                      fontSize: 11,
                      color: '#7d8590',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Grid with Day Labels */}
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Day Labels */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: 88,
                    fontSize: 10,
                    color: '#7d8590',
                    lineHeight: '10px',
                    width: 24,
                    textAlign: 'left',
                    userSelect: 'none',
                    paddingTop: 11,
                    paddingBottom: 11,
                  }}
                >
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Heatmap grid */}
                <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, 10px)', gap: 3 }}>
                  {weeks.map((week, wIdx) =>
                    week.map((item, dIdx) => {
                      const color = LEVEL_COLORS[item.level] || LEVEL_COLORS[0];
                      const dateFormatted = formatDate(item.date);

                      return (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              text: item.count === 0 ? 'No contributions' : `${item.count} contribution${item.count > 1 ? 's' : ''}`,
                              subText: dateFormatted ? `on ${dateFormatted}` : undefined,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: color,
                            outline: item.level === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  fontSize: 11,
                  color: '#7d8590',
                  paddingLeft: 2,
                }}
              >
                <a
                  href="https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7d8590', textDecoration: 'none', fontSize: 11 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#58a6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#7d8590')}
                >
                  Learn how we count contributions
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <span>Less</span>
                  {LEVEL_COLORS.map((bg, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: bg,
                        display: 'inline-block',
                        outline: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'fixed',
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
                background: '#24292f',
                color: '#f0f6fc',
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                pointerEvents: 'none',
                zIndex: 99999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                border: '1px solid #30363d',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              <span>{tooltip.text}</span>
              {tooltip.subText && <span style={{ color: '#8b949e', marginLeft: 4 }}>{tooltip.subText}</span>}
            </div>
          )}
        </div>

        {/* Year Pills (Right side) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {AVAILABLE_YEARS.map((yr) => {
            const isActive = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? '#1f6feb' : 'transparent',
                  color: isActive ? '#ffffff' : '#7d8590',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#21262d';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {yr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
