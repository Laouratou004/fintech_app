import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { refreshRates, fetchTransfers } from '../store/transferSlice';
import { fetchBeneficiaries } from '../store/beneficiariesSlice';
import { radius, spacing, typography, shadows } from '../theme';
import Card from '../components/Card';
import StatBlock from '../components/StatBlock';
import TransferCard from '../components/TransferCard';
import { formatCurrency } from '../utils/currencyUtils';

const HomeScreen = ({ navigation }) => {
  const { colors, isDark, toggle } = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const { transfers, rates, ratesLoading, ratesUpdatedAt } = useSelector(
    (s) => s.transfers
  );
  const beneficiaries = useSelector((s) => s.beneficiaries.list);

  // Au montage, on récupère les données Supabase + le taux BCRG
  useEffect(() => {
    dispatch(refreshRates());
    dispatch(fetchTransfers());
    dispatch(fetchBeneficiaries());
  }, [dispatch]);

  const onRefreshAll = () => {
    dispatch(refreshRates());
    dispatch(fetchTransfers());
    dispatch(fetchBeneficiaries());
  };

  const stats = useMemo(() => {
    const totalSent = transfers.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const completed = transfers.filter((t) => t.status === 'completed').length;
    return { totalSent, completed, count: transfers.length };
  }, [transfers]);

  const favorites = beneficiaries.filter((b) => b.favorite).slice(0, 4);
  const recent = transfers.slice(0, 3);

  const usedPct = Math.min(
    100,
    Math.round((user.monthlyUsed / user.monthlyLimit) * 100)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        refreshControl={
          <RefreshControl
            refreshing={ratesLoading}
            onRefresh={onRefreshAll}
            tintColor={colors.primary}
          />
        }
      >
        {/* En-tête utilisateur */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.textInverse }]}>
              {user.avatarInitials}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>
              Bonjour 👋
            </Text>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {user.fullName}
            </Text>
          </View>
          <Pressable
            onPress={toggle}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Profil')}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginLeft: spacing.sm }]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Carte hero — taux BCRG en vedette */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.primary },
            shadows(colors.primary + '55').card,
          ]}
        >
          <View style={styles.heroTop}>
            <Text style={[styles.heroLabel, { color: '#ffffffcc' }]}>
              Taux officiel BCRG
            </Text>
            <View style={styles.live}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.heroValue}>
            1 € = {rates.EUR?.toLocaleString('fr-FR')} GNF
          </Text>
          <View style={styles.ratesRow}>
            <View style={styles.rateItem}>
              <Text style={styles.rateCcy}>USD</Text>
              <Text style={styles.rateVal}>{rates.USD?.toLocaleString('fr-FR')}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateCcy}>CAD</Text>
              <Text style={styles.rateVal}>{rates.CAD?.toLocaleString('fr-FR')}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateCcy}>GBP</Text>
              <Text style={styles.rateVal}>{rates.GBP?.toLocaleString('fr-FR')}</Text>
            </View>
          </View>
          {ratesUpdatedAt ? (
            <Text style={styles.heroHint}>
              Mis à jour {new Date(ratesUpdatedAt).toLocaleTimeString('fr-FR')}
            </Text>
          ) : (
            <Text style={styles.heroHint}>Tirez pour actualiser</Text>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.quickRow}>
          <QuickAction
            icon="paper-plane"
            label="Envoyer"
            color={colors.primary}
            onPress={() => navigation.navigate('Transfert')}
          />
          <QuickAction
            icon="people"
            label="Bénéficiaires"
            color={colors.accent}
            onPress={() => navigation.navigate('Carnet')}
          />
          <QuickAction
            icon="time"
            label="Historique"
            color={colors.info}
            onPress={() => navigation.navigate('Historique')}
          />
          <QuickAction
            icon="qr-code"
            label="Scanner"
            color={colors.danger}
            onPress={() => {}}
          />
        </View>

        {/* Plafond mensuel + KYC */}
        <Card>
          <View style={styles.limitRow}>
            <View>
              <Text style={[styles.limitLabel, { color: colors.textMuted }]}>
                Plafond mensuel
              </Text>
              <Text style={[styles.limitVal, { color: colors.text }]}>
                {formatCurrency(user.monthlyUsed, user.preferredCurrency)} /{' '}
                {formatCurrency(user.monthlyLimit, user.preferredCurrency)}
              </Text>
            </View>
            <View
              style={[
                styles.kycBadge,
                {
                  backgroundColor:
                    user.kycLevel === 'verified' ? colors.primarySoft : colors.dangerSoft,
                },
              ]}
            >
              <Ionicons
                name={user.kycLevel === 'verified' ? 'shield-checkmark' : 'alert-circle'}
                size={14}
                color={user.kycLevel === 'verified' ? colors.primary : colors.danger}
              />
              <Text
                style={[
                  styles.kycText,
                  {
                    color: user.kycLevel === 'verified' ? colors.primary : colors.danger,
                  },
                ]}
              >
                KYC {user.kycLevel === 'verified' ? 'Vérifié' : 'En attente'}
              </Text>
            </View>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.progressFg,
                { backgroundColor: colors.primary, width: `${usedPct}%` },
              ]}
            />
          </View>
        </Card>

        {/* Statistiques rapides */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.statsRow}>
            <StatBlock
              label="Total envoyé"
              value={formatCurrency(stats.totalSent, user.preferredCurrency, { compact: true })}
              hint="Cumul global"
              color={colors.primary}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <StatBlock label="Transferts" value={stats.count} hint={`${stats.completed} reçus`} />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <StatBlock
              label="Économisé"
              value={formatCurrency(Math.round(stats.totalSent * 0.03), user.preferredCurrency, { compact: true })}
              hint="vs banque"
              color={colors.accent}
            />
          </View>
        </Card>

        {/* Bénéficiaires favoris */}
        {favorites.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bénéficiaires favoris
              </Text>
              <Pressable onPress={() => navigation.navigate('Carnet')}>
                <Text style={[styles.sectionLink, { color: colors.primary }]}>
                  Tout voir
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.md, paddingVertical: 4 }}
            >
              {favorites.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() =>
                    navigation.navigate('Transfert', { beneficiaryId: b.id })
                  }
                  style={[
                    styles.favCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.favAvatar,
                      { backgroundColor: colors.accentSoft },
                    ]}
                  >
                    <Text style={[styles.favInitials, { color: colors.accent }]}>
                      {b.name
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')}
                    </Text>
                  </View>
                  <Text
                    style={[styles.favName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {b.name.split(' ')[0]}
                  </Text>
                  <Text
                    style={[styles.favRel, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {b.relation}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Transferts récents */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Transferts récents
            </Text>
            <Pressable onPress={() => navigation.navigate('Historique')}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>
                Historique complet
              </Text>
            </Pressable>
          </View>
          {recent.length === 0 ? (
            <Card>
              <Text style={[{ color: colors.textMuted, textAlign: 'center' }]}>
                Aucun transfert pour l'instant
              </Text>
            </Card>
          ) : (
            recent.map((t) => (
              <TransferCard
                key={t.id}
                transfer={t}
                onPress={() => navigation.navigate('TransferDetail', { id: t.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Sous-composant: bouton d'action rapide circulaire
const QuickAction = ({ icon, label, color, onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
      <View
        style={[
          styles.quickCircle,
          { backgroundColor: color + '22', borderColor: color + '44' },
        ]}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3 },
  greeting: { ...typography.small },
  userName: { ...typography.h2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: { ...typography.tiny, textTransform: 'uppercase', color: '#ffffffcc' },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  heroValue: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  ratesRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
  rateItem: {
    backgroundColor: '#ffffff1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    flex: 1,
  },
  rateCcy: { color: '#ffffffaa', fontSize: 11, fontWeight: '600' },
  rateVal: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  heroHint: { color: '#ffffff99', marginTop: spacing.md, fontSize: 12 },

  quickRow: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 6,
  },
  quickLabel: { ...typography.small },

  limitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  limitLabel: { ...typography.tiny, textTransform: 'uppercase' },
  limitVal: { ...typography.h3, marginTop: 4 },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 4,
    alignSelf: 'flex-start',
  },
  kycText: { ...typography.tiny },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFg: { height: '100%', borderRadius: 4 },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 40, marginHorizontal: spacing.sm },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2 },
  sectionLink: { ...typography.small },

  favCard: {
    width: 110,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  favAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  favInitials: { ...typography.h3 },
  favName: { ...typography.body },
  favRel: { ...typography.small, marginTop: 2 },
});

export default HomeScreen;
