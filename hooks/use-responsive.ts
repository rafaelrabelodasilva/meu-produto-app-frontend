import { useWindowDimensions, Platform } from 'react-native';

export const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export const MAX_CONTENT_WIDTH = 600;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Padrão da indústria: se o menor lado da tela for >= 600, é um tablet.
  // Isso diferencia um iPhone Max em landscape (que é largo mas baixo) de um iPad real.
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  
  const isDesktop = width >= BREAKPOINTS.DESKTOP;
  const isPortrait = height > width;

  // Calcula a largura ideal para containers de formulários
  const contentWidth = isTablet ? Math.min(width * 0.8, 800) : width;
  const formWidth = isTablet ? Math.min(width * 0.6, 500) : width - 48;

  // Cálculo de padding para centralizar itens da TabBar sem usar position absolute
  const tabBarHorizontalPadding = isTablet ? (width - Math.min(width, 700)) / 2 : 0;

  return {
    width,
    height,
    isTablet,
    isDesktop,
    isPortrait,
    contentWidth,
    formWidth,
    tabBarHorizontalPadding,
    pick: <T>(phone: T, tablet: T): T => (isTablet ? tablet : phone),
  };
};
