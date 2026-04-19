/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#FFD164',
    secondary: '#0042cf',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#11181C',
    subtitle: '#64748B',
    inputBg: '#F1F5F9',
    white: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    border: '#E2E8F0',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#0042cf',
  },
  dark: {
    primary: '#FFD164',
    secondary: '#3B82F6',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    subtitle: '#94A3B8',
    inputBg: '#334155',
    white: '#FFFFFF',
    error: '#F87171',
    success: '#34D399',
    border: '#334155',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
