

import type { Styles } from 'react-joyride';

export const getJoyrideStyles = (theme: string): Styles => ({
  beacon: {},
  beaconInner: {},
  beaconOuter: {},
  options: {
    zIndex: 10000,
    primaryColor: '#0066FF',
    textColor: theme === 'dark' ? '#E6EDF3' : '#333',
    backgroundColor: theme === 'dark' ? '#1A1B1D' : '#fff',
    arrowColor: theme === 'dark' ? '#1A1B1D' : '#fff',
    beaconSize: 36,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spotlightShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px',
  },
  buttonNext: {
    backgroundColor: '#0066FF',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    outline: 'none',
  },
  buttonBack: {
    color: theme === 'dark' ? '#aaa' : '#666',
    marginRight: 10,
  },
  buttonClose: {},
  buttonSkip: {
    color: theme === 'dark' ? '#aaa' : '#666',
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
