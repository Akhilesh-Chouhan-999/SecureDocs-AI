export const THEME = {
  COLORS: {
    PRIMARY: '#b3c5ff',
    SECONDARY: '#d0bcff',
    ERROR: '#ffb4ab',
    SUCCESS: '#66bb6a',
    WARNING: '#ffa726',
    SURFACE: '#111318',
    BACKGROUND: '#111318',
  },
  BREAKPOINTS: {
    MOBILE: '640px',
    TABLET: '768px',
    LAPTOP: '1024px',
    DESKTOP: '1280px',
  },
  TRANSITIONS: {
    FAST: '150ms ease',
    NORMAL: '300ms ease-in-out',
    SLOW: '500ms ease-in-out',
  },
  Z_INDEX: {
    MODAL: 50,
    OVERLAY: 40,
    NAVBAR: 30,
    SIDEBAR: 20,
    BASE: 1,
  },
} as const;
