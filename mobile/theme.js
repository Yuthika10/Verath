// Verath Mobile Theme - Design Tokens
import { Platform } from 'react-native';

export const colors = {
  // Brand Colors
  background:   '#0A0A0F',
  surface:      '#111118',
  card:         '#16161F',
  border:       'rgba(255,255,255,0.07)',
  borderHover:  'rgba(255,255,255,0.13)',

  // Accent Palette
  accentPrimary:   '#6C63FF',   // Electric violet
  accentSecondary: '#00D4AA',   // Mint teal
  accentWarm:      '#FF6B6B',   // Soft coral
  accentGold:      '#F5A623',   // Amber

  // Text
  textPrimary:   '#F0F0FF',
  textSecondary: '#9898B8',
  textTertiary:  '#5A5A7A',
  textMuted:     '#3A3A5A',

  // Semantic
  success: '#00D4AA',
  warning: '#F5A623',
  danger:  '#FF5A5A',
  info:    '#6C63FF',
};

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_600SemiBold',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  40,
  xxl: 64,
};

export const radius = {
  sm:  6,
  md:  12,
  lg:  20,
  xl:  32,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const intentColors = {
  meeting:    { bg: 'rgba(108,99,255,0.15)', text: '#6C63FF', border: '#6C63FF' },
  deadline:   { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B', border: '#FF6B6B' },
  task:       { bg: 'rgba(0,212,170,0.15)', text: '#00D4AA', border: '#00D4AA' },
  reminder:   { bg: 'rgba(245,166,35,0.15)', text: '#F5A623', border: '#F5A623' },
  commitment: { bg: 'rgba(108,99,255,0.12)', text: '#9B8CFF', border: '#9B8CFF' },
};

export const animations = {
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
  },
  easing: {
    out: [0.0, 0.0, 0.2, 1],
    spring: [0.34, 1.56, 0.64, 1],
  },
};
