// Palette inspirée du drapeau guinéen (rouge, jaune, vert) déclinée en tons fintech modernes
export const lightColors = {
  // Fond et surfaces
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F8',

  // Marque
  primary: '#0B7A3B',        // Vert Guinée profond
  primaryDark: '#075C2C',
  primarySoft: '#E3F4EA',
  accent: '#F5B400',         // Jaune-or
  accentSoft: '#FFF4D2',
  danger: '#D7263D',
  dangerSoft: '#FDE7EA',
  success: '#1F9D55',
  warning: '#E08E0B',
  info: '#2563EB',

  // Texte
  text: '#0F172A',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  // Bordures et effets
  border: '#E2E8F0',
  divider: '#EDF1F7',
  shadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

export const darkColors = {
  background: '#0B1220',
  surface: '#121A2B',
  surfaceAlt: '#1A2540',

  primary: '#22C55E',
  primaryDark: '#15803D',
  primarySoft: '#103B23',
  accent: '#FBBF24',
  accentSoft: '#3A2E0A',
  danger: '#F87171',
  dangerSoft: '#3B1A1F',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',

  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textInverse: '#0F172A',

  border: '#243049',
  divider: '#1B2540',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '500' },
  small: { fontSize: 13, fontWeight: '500' },
  tiny: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
};

export const shadows = (color) => ({
  card: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
});
