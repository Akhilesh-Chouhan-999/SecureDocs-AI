import { useState, useEffect } from 'react';
import { THEME } from '../constants/theme';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setWindowSize({
        width,
        height: window.innerHeight,
        isMobile: width < parseInt(THEME.BREAKPOINTS.TABLET),
        isTablet: width >= parseInt(THEME.BREAKPOINTS.TABLET) && width < parseInt(THEME.BREAKPOINTS.LAPTOP),
        isDesktop: width >= parseInt(THEME.BREAKPOINTS.LAPTOP),
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
