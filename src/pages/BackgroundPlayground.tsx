import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui/Card';
import Button from '../shared/ui/Button';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon } from 'lucide-react';

const BACKGROUNDS = [
  { id: 'solid', label: 'Solid surface', className: 'bg-[var(--color-surface)] dark:bg-[var(--color-background-dark)]' },
  { id: 'dot-grid', label: 'Dot grid', className: 'bg-dot-grid' },
  { id: 'soft-gradient', label: 'Soft gradient', className: 'bg-[radial-gradient(circle_at_top,_#e0edff,_transparent_55%),radial-gradient(circle_at_bottom,_#fde1ff,_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_#1f3b66,_transparent_55%),radial-gradient(circle_at_bottom,_#3b1f66,_transparent_55%)]' },
  { id: 'subtle-diagonal', label: 'Diagonal lines', className: 'bg-[repeating-linear-gradient(135deg,_rgba(15,23,42,0.04)_0,_rgba(15,23,42,0.04)_1px,_transparent_1px,_transparent_8px)] dark:bg-[repeating-linear-gradient(135deg,_rgba(230,237,243,0.08)_0,_rgba(230,237,243,0.08)_1px,_transparent_1px,_transparent_8px)]' },
  { id: 'soft-waves', label: 'Soft waves', className: 'bg-[radial-gradient(circle_at_0%_0%,_rgba(0,102,255,0.08)_0,_transparent_55%),radial-gradient(circle_at_100%_100%,_rgba(56,189,248,0.08)_0,_transparent_55%)] dark:bg-[radial-gradient(circle_at_0%_0%,_rgba(56,189,248,0.18)_0,_transparent_55%),radial-gradient(circle_at_100%_100%,_rgba(129,140,248,0.18)_0,_transparent_55%)]' },
  { id: 'mesh', label: 'Mesh gradient', className: 'bg-[radial-gradient(circle_at_10%_20%,_rgba(96,165,250,0.20)_0,_transparent_55%),radial-gradient(circle_at_90%_80%,_rgba(244,114,182,0.18)_0,_transparent_55%),radial-gradient(circle_at_50%_100%,_rgba(129,140,248,0.18)_0,_transparent_55%)] dark:bg-[radial-gradient(circle_at_10%_20%,_rgba(37,99,235,0.25)_0,_transparent_55%),radial-gradient(circle_at_90%_80%,_rgba(190,24,93,0.25)_0,_transparent_55%),radial-gradient(circle_at_50%_100%,_rgba(79,70,229,0.25)_0,_transparent_55%)]' },
  { id: 'scanlines', label: 'Scan lines', className: 'bg-[repeating-linear-gradient(180deg,_rgba(15,23,42,0.04)_0,_rgba(15,23,42,0.04)_1px,_transparent_1px,_transparent_6px)] dark:bg-[repeating-linear-gradient(180deg,_rgba(148,163,184,0.16)_0,_rgba(148,163,184,0.16)_1px,_transparent_1px,_transparent_6px)]' },
];

const BackgroundPlayground: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('dot-grid');
  const { theme, setTheme, toggleTheme } = useThemeStore();

  const selected = BACKGROUNDS.find(bg => bg.id === selectedId) ?? BACKGROUNDS[0];

  return (
    <div className="space-y-8">
      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 space-y-2">
            <CardTitle className="text-3xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Background Playground
            </CardTitle>
            <CardDescription>
              Testează tipuri de fundal care pot fi aplicate pe toate paginile, atât în Light cât și în Dark.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Selectează un tip de fundal
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                Tema:
              </span>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] px-1 py-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-white text-[var(--color-foreground)] shadow-sm'
                      : 'text-[var(--color-muted-foreground)]'
                  }`}
                >
                  <Sun size={14} />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-[var(--color-background-dark)] text-[var(--color-foreground-dark)] shadow-sm'
                      : 'text-[var(--color-muted-foreground)]'
                  }`}
                >
                  <Moon size={14} />
                  Dark
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="flex flex-wrap gap-3">
              {BACKGROUNDS.map((bg) => (
                <Button
                  key={bg.id}
                  variant={bg.id === selectedId ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedId(bg.id)}
                >
                  {bg.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-sm font-semibold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Preview (folosește tema actuală Light/Dark din Setări)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div
              className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] min-h-[420px] p-8 transition-colors ${selected.className}`}
            >
              <div className="max-w-3xl mx-auto h-full flex flex-col justify-between gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-2">
                    Exemplu Dashboard
                  </p>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                    Salut, Student!
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                    Aici vezi cum ar arăta layout-ul tău principal peste acest tip de fundal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">
                      Card principal
                    </p>
                    <p className="text-base font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                      Drumul spre Certificare
                    </p>
                  </div>
                  <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">
                      Card secundar
                    </p>
                    <p className="text-base font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                      Activitate Săptămânală
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BackgroundPlayground;
