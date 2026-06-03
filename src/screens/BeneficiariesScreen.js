import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import {
  addBeneficiary,
  removeBeneficiary,
  toggleFavorite,
} from '../store/beneficiariesSlice';
import { radius, spacing, typography, shadows } from '../theme';
import { mobileNetworks, getNetwork } from '../data/networks';

import Card from '../components/Card';
import TextField from '../components/TextField';
import SegmentedPicker from '../components/SegmentedPicker';
import PrimaryButton from '../components/PrimaryButton';

const BeneficiariesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const list = useSelector((s) => s.beneficiaries.list);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    relation: '',
    network: 'orange-money',
  });
  const [errors, setErrors] = useState({});

  const save = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (form.phone.replace(/\s+/g, '').length < 8) e.phone = 'Numéro invalide';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch(addBeneficiary(form));
    setForm({ name: '', phone: '', relation: '', network: 'orange-money' });
    setModal(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Bénéficiaires</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {list.length} contacts enregistrés
          </Text>
        </View>
        <Pressable
          onPress={() => setModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={26} color={colors.textInverse} />
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: 0,
          paddingBottom: spacing.xxxl,
        }}
        renderItem={({ item }) => {
          const net = getNetwork(item.network);
          const initials = item.name
            .split(' ')
            .map((s) => s[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('Transfert', { beneficiaryId: item.id })
              }
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                shadows(colors.shadow).soft,
              ]}
            >
              <View
                style={[styles.avatar, { backgroundColor: net.color + '22' }]}
              >
                <Text style={[styles.avatarText, { color: net.color }]}>
                  {initials}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {item.favorite ? (
                    <Ionicons
                      name="star"
                      size={14}
                      color={colors.accent}
                      style={{ marginLeft: 6 }}
                    />
                  ) : null}
                </View>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {item.relation} • {item.phone}
                </Text>
                <View
                  style={[styles.netPill, { backgroundColor: net.color + '1A' }]}
                >
                  <Text style={[styles.netPillText, { color: net.color }]}>
                    {net.name}
                  </Text>
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Pressable
                  onPress={() => dispatch(toggleFavorite(item.id))}
                  style={[styles.iconAction, { borderColor: colors.border }]}
                >
                  <Ionicons
                    name={item.favorite ? 'star' : 'star-outline'}
                    size={18}
                    color={item.favorite ? colors.accent : colors.textMuted}
                  />
                </Pressable>
                <Pressable
                  onPress={() => dispatch(removeBeneficiary(item.id))}
                  style={[styles.iconAction, { borderColor: colors.border }]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text
              style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}
            >
              Ajoutez votre premier bénéficiaire pour démarrer
            </Text>
          </Card>
        }
      />

      {/* Modal d'ajout */}
      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Nouveau bénéficiaire
              </Text>
              <Pressable onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <TextField
              label="Nom complet"
              placeholder="Aïssata Bah"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              error={errors.name}
            />
            <TextField
              label="Téléphone"
              placeholder="+224 622 00 00 00"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
            />
            <TextField
              label="Relation (optionnel)"
              placeholder="Mère, frère, ami…"
              value={form.relation}
              onChangeText={(v) => setForm({ ...form, relation: v })}
            />
            <SegmentedPicker
              label="Réseau Mobile Money"
              value={form.network}
              onChange={(v) => setForm({ ...form, network: v })}
              options={mobileNetworks.map((n) => ({ value: n.id, label: n.name }))}
            />
            <PrimaryButton
              title="Enregistrer"
              onPress={save}
              icon={<Ionicons name="checkmark" size={18} color={colors.textInverse} />}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { ...typography.display },
  subtitle: { ...typography.body, marginTop: 2 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: {
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
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3 },
  name: { ...typography.h3 },
  meta: { ...typography.small, marginTop: 2 },
  netPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 6,
  },
  netPillText: { ...typography.tiny },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h1 },
});

export default BeneficiariesScreen;
