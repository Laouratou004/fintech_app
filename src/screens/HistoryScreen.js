import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme';
import TransferCard from '../components/TransferCard';
import SegmentedPicker from '../components/SegmentedPicker';
import { formatCurrency } from '../utils/currencyUtils';

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const transfers = useSelector((s) => s.transfers.transfers);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const matchesQuery =
        !query ||
        t.receiverName.toLowerCase().includes(query.toLowerCase()) ||
        t.reference.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || t.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [transfers, query, filter]);

  const totals = useMemo(() => {
    const sum = filtered.reduce((acc, t) => acc + t.amount, 0);
    return { count: filtered.length, sum };
  }, [filtered]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <Text style={[styles.title, { color: colors.text }]}>Historique</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {totals.count} transferts • {formatCurrency(totals.sum, 'EUR')}
        </Text>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Rechercher un bénéficiaire ou une référence"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <SegmentedPicker
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'completed', label: 'Reçus' },
            { value: 'pending', label: 'En cours' },
            { value: 'failed', label: 'Échec' },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxxl,
        }}
        renderItem={({ item }) => (
          <TransferCard
            transfer={item}
            onPress={() => navigation.navigate('TransferDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Aucun transfert ne correspond à votre recherche
            </Text>
          </View>
        }
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { ...typography.display, marginBottom: 4 },
  subtitle: { ...typography.body, marginBottom: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyText: { ...typography.body, textAlign: 'center', paddingHorizontal: spacing.xl },
});

export default HistoryScreen;
