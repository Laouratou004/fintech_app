import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme';

// Bouton principal animé avec variantes (primary, ghost, danger)
const PrimaryButton = ({ title, onPress, loading, disabled, variant = 'primary', icon, style }) => {
  const { colors } = useTheme();

  const palettes = {
    primary: { bg: colors.primary, fg: colors.textInverse, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, fg: colors.textInverse, border: 'transparent' },
    soft: { bg: colors.primarySoft, fg: colors.primary, border: 'transparent' },
  };
  const p = palettes[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={{ marginRight: spacing.sm }}>{icon}</View> : null}
          <Text style={[styles.label, { color: p.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 52,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { ...typography.h3 },
});

export default PrimaryButton;
