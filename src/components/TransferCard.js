import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography, shadows } from '../theme';
import { formatCurrency } from '../utils/currencyUtils';
import { getNetwork } from '../data/networks';

// Carte d'un transfert dans l'historique — affiche bénéficiaire, montant, statut
const STATUS_LABEL = {
  completed: { text: 'Reçu', tone: 'success' },
  pending: { text: 'En cours', tone: 'warning' },
  failed: { text: 'Échec', tone: 'danger' },
};

const TransferCard = ({ transfer, onPress }) => {
  const { colors } = useTheme();
  const network = getNetwork(transfer.network);
  const status = STATUS_LABEL[transfer.status] || STATUS_LABEL.pending;
  const toneColor = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[status.tone];

  const initials = transfer.receiverName
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  const date = new Date(transfer.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
        shadows(colors.shadow).soft,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {transfer.receiverName}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.dot, { backgroundColor: network?.color }]} />
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
            {network?.name} • {date}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(transfer.amount, transfer.currency)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: toneColor + '22' }]}>
          <Text style={[styles.statusText, { color: toneColor }]}>{status.text}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3 },
  name: { ...typography.h3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  meta: { ...typography.small },
  amount: { ...typography.h3 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  statusText: { ...typography.tiny },
});

export default TransferCard;
