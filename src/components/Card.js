import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, shadows } from '../theme';

// Carte conteneur réutilisable — base visuelle de toute l'application
const Card = ({ children, style, padded = true, variant = 'surface' }) => {
  const { colors } = useTheme();
  const bg = variant === 'surface' ? colors.surface : colors.surfaceAlt;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: colors.border },
        shadows(colors.shadow).card,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: spacing.lg,
  },
});

export default Card;
