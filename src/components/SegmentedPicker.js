import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme';

// Sélecteur segmenté horizontal — devise, réseau, période, etc.
const SegmentedPicker = ({ label, options, value, onChange, renderItem }) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {renderItem ? (
                renderItem(opt, active)
              ) : (
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.textInverse : colors.text },
                  ]}
                >
                  {opt.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...typography.tiny,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    minHeight: 42,
    justifyContent: 'center',
  },
  chipText: { ...typography.body },
});

export default SegmentedPicker;
