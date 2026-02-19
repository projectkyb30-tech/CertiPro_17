

import type { Styles } from 'react-joyride';

export const getJoyrideStyles = (theme: string): Styles => ({
  beacon: {},
  beaconInner: {},
  beaconOuter: {},
  options: {
    zIndex: 10000,
    primaryColor: 'var(--color-primary)',
    textColor: theme === 'dark' ? 'var(--color-foreground-dark)' : 'var(--color-foreground)',
    backgroundColor: theme === 'dark' ? 'var(--color-card-dark)' : 'var(--color-card)',
    arrowColor: theme === 'dark' ? 'var(--color-card-dark)' : 'var(--color-card)',
    beaconSize: 36,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spotlightShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px',
  },
  buttonNext: {
    backgroundColor: 'var(--color-primary)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: 'bold',
    outline: 'none',
  },
  buttonBack: {
    color: theme === 'dark' ? 'var(--color-muted-foreground-dark)' : 'var(--color-muted-foreground)',
    marginRight: 10,
  },
  buttonClose: {},
  buttonSkip: {
    color: theme === 'dark' ? 'var(--color-muted-foreground-dark)' : 'var(--color-muted-foreground)',
  },
  overlay: {},
  overlayLegacy: {},
  overlayLegacyCenter: {},
  spotlight: {},
  spotlightLegacy: {},
  tooltipContainer: {},
  tooltipContent: {},
  tooltipFooter: {},
  tooltipFooterSpacer: {},
  tooltipTitle: {}
});

export const JOYRIDE_LOCALE = {
  back: 'Înapoi',
  close: 'Închide',
  last: 'Gata!',
  next: 'Înainte',
  skip: 'Sari peste',
};
