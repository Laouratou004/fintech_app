import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography, shadows } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/currencyUtils';
import { getNetwork } from '../data/networks';

const STATUS_MAP = {
  completed: { label: 'Reçu avec succès', icon: 'checkmark-circle', tone: 'success' },
  pending: { label: 'En cours de traitement', icon: 'time', tone: 'warning' },
  failed: { label: 'Transfert échoué', icon: 'close-circle', tone: 'danger' },
};

const TransferDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const transfer = useSelector((s) =>
    s.transfers.transfers.find((t) => t.id === route.params?.id)
  );

  if (!transfer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, padding: spacing.lg }}>
          Transfert introuvable.
        </Text>
      </SafeAreaView>
    );
  }

  const net = getNetwork(transfer.network);
  const status = STATUS_MAP[transfer.status];
  const tone = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[status.tone];

  const onShare = async () => {
    await Share.share({
      message: `Reçu Diaspora Pay\nRéférence: ${transfer.reference}\nBénéficiaire: ${transfer.receiverName}\nMontant: ${formatCurrency(
        transfer.amount,
        transfer.currency
      )}\nReçu: ${formatCurrency(transfer.receivedGNF, 'GNF')}`,
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Détails</Text>
        <Pressable
          onPress={onShare}
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Statut */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: tone + '15', borderColor: tone + '44' },
            shadows(colors.shadow).soft,
          ]}
        >
          <Ionicons name={status.icon} size={48} color={tone} />
          <Text style={[styles.statusLabel, { color: tone }]}>{status.label}</Text>
          <Text style={[styles.reference, { color: colors.textMuted }]}>
            Référence {transfer.reference}
          </Text>
        </View>

        {/* Montants */}
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            MONTANT ENVOYÉ
          </Text>
          <Text style={[styles.bigAmount, { color: colors.text }]}>
            {formatCurrency(transfer.amount, transfer.currency)}
          </Text>
          <View
            style={[
              styles.arrowBox,
              { backgroundColor: colors.primarySoft, borderColor: colors.primary + '33' },
            ]}
          >
            <Ionicons name="arrow-down" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>BÉNÉFICIAIRE REÇOIT</Text>
          <Text style={[styles.bigAmount, { color: colors.primary }]}>
            {formatCurrency(transfer.receivedGNF, 'GNF')}
          </Text>
        </Card>

        {/* Détails */}
        <Card style={{ marginTop: spacing.md }}>
          <Detail label="Bénéficiaire" value={transfer.receiverName} />
          <Detail label="Téléphone" value={transfer.receiverPhone} />
          <Detail
            label="Réseau"
            value={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: net.color,
                    marginRight: 6,
                  }}
                />
                <Text style={{ color: colors.text, fontWeight: '600' }}>{net.name}</Text>
              </View>
            }
          />
          <Detail label="Frais" value={formatCurrency(transfer.fees, transfer.currency)} />
          <Detail
            label="Taux BCRG"
            value={`1 ${transfer.currency} = ${transfer.rate.toLocaleString('fr-FR')} GNF`}
          />
          <Detail
            label="Date"
            value={new Date(transfer.createdAt).toLocaleString('fr-FR')}
          />
        </Card>

        <PrimaryButton
          title="Refaire ce transfert"
          variant="ghost"
          icon={<Ionicons name="repeat" size={18} color={colors.primary} />}
          onPress={() => navigation.navigate('Transfert')}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const Detail = ({ label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { flex: 1, textAlign: 'center', ...typography.h2 },

  statusCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  statusLabel: { ...typography.h2, marginTop: spacing.sm },
  reference: { ...typography.small, marginTop: 4 },

  cardTitle: { ...typography.tiny, textTransform: 'uppercase' },
  bigAmount: { fontSize: 28, fontWeight: '800', marginVertical: 6 },
  arrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    marginVertical: spacing.sm,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: { ...typography.body },
  detailValue: { ...typography.body, fontWeight: '600' },
});

export default TransferDetailScreen;
