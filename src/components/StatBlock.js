import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

// Bloc statistique compact pour le tableau de bord
const StatBlock = ({ label, value, hint, color }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: color || colors.text }]}>{value}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingVertical: spacing.xs },
  label: { ...typography.tiny, textTransform: 'uppercase' },
  value: { ...typography.h2, marginTop: 4 },
  hint: { ...typography.small, marginTop: 2 },
});

export default StatBlock;
