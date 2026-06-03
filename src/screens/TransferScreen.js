import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { createTransfer } from '../store/transferSlice';
import { calculateBreakdown } from '../utils/feeUtils';
import { validateTransfer } from '../utils/validation';
import { formatCurrency, symbolOf } from '../utils/currencyUtils';
import { countries, currencies } from '../data/countries';
import { mobileNetworks } from '../data/networks';
import { radius, spacing, typography, shadows } from '../theme';

import Card from '../components/Card';
import TextField from '../components/TextField';
import SegmentedPicker from '../components/SegmentedPicker';
import PrimaryButton from '../components/PrimaryButton';

const TransferScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { rates } = useSelector((s) => s.transfers);
  const beneficiaries = useSelector((s) => s.beneficiaries.list);

  const presetBenef = beneficiaries.find((b) => b.id === route.params?.beneficiaryId);

  // États du formulaire
  const [country, setCountry] = useState('FR');
  const [currency, setCurrency] = useState(user.preferredCurrency);
  const [amount, setAmount] = useState('');
  const [receiverName, setReceiverName] = useState(presetBenef?.name || '');
  const [receiverPhone, setReceiverPhone] = useState(presetBenef?.phone || '');
  const [network, setNetwork] = useState(presetBenef?.network || 'orange-money');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const rate = rates[currency] || 9500;
  const breakdown = useMemo(
    () => calculateBreakdown({ amount, network, countryCode: country, rate }),
    [amount, network, country, rate]
  );

  const validation = useMemo(
    () =>
      validateTransfer({
        amount,
        receiverName,
        receiverPhone,
        network,
        monthlyUsed: user.monthlyUsed,
        monthlyLimit: user.monthlyLimit,
      }),
    [amount, receiverName, receiverPhone, network, user]
  );

  useEffect(() => {
    if (presetBenef && route.params?.beneficiaryId) {
      setReceiverName(presetBenef.name);
      setReceiverPhone(presetBenef.phone);
      setNetwork(presetBenef.network);
    }
  }, [route.params?.beneficiaryId]);

  const submit = async () => {
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSubmitting(true);
    try {
      const action = await dispatch(
        createTransfer({
          receiverName,
          receiverPhone,
          network,
          countryCode: country,
          currency,
          amount: breakdown.amount,
          fees: breakdown.fees,
          rate,
          receivedGNF: breakdown.receivedGNF,
        })
      );
      if (action.type.endsWith('/rejected')) {
        Alert.alert('Erreur', action.payload || 'Échec du transfert');
        return;
      }
      const transfer = action.payload;
      Alert.alert(
        'Transfert initié',
        `Réf ${transfer.reference}\nLe bénéficiaire recevra ${formatCurrency(
          transfer.receivedGNF,
          'GNF'
        )}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              navigation.navigate('Historique');
            },
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
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
          <Text style={[styles.title, { color: colors.text }]}>
            Nouveau transfert
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing.xxxl,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pays d'origine */}
          <SegmentedPicker
            label="Pays d'origine"
            value={country}
            onChange={(v) => {
              setCountry(v);
              const c = countries.find((x) => x.code === v);
              if (c) setCurrency(c.currency);
            }}
            options={countries.map((c) => ({
              value: c.code,
              label: c.name,
            }))}
          />

          {/* Devise */}
          <SegmentedPicker
            label="Devise"
            value={currency}
            onChange={setCurrency}
            options={currencies.map((c) => ({
              value: c.code,
              label: `${c.symbol} ${c.code}`,
            }))}
          />

          {/* Carte de montant */}
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Montant à envoyer
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencyPrefix, { color: colors.primary }]}>
                {symbolOf(currency)}
              </Text>
              <Text
                style={[
                  styles.amountInput,
                  { color: amount ? colors.text : colors.textMuted },
                ]}
              >
                {amount || '0'}
              </Text>
            </View>
            <View
              style={[
                styles.converterBox,
                { backgroundColor: colors.primarySoft, borderColor: colors.primary + '33' },
              ]}
            >
              <Ionicons name="arrow-down" size={16} color={colors.primary} />
              <Text style={[styles.converterText, { color: colors.primary }]}>
                Le bénéficiaire reçoit {formatCurrency(breakdown.receivedGNF, 'GNF')}
              </Text>
            </View>

            {/* Pavé numérique compact */}
            <View style={styles.numpad}>
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
                <Pressable
                  key={k}
                  onPress={() => {
                    if (k === '⌫') {
                      setAmount((p) => p.slice(0, -1));
                    } else if (k === '.') {
                      if (!amount.includes('.')) setAmount((p) => (p || '0') + '.');
                    } else {
                      setAmount((p) => (p + k).replace(/^0+(?=\d)/, ''));
                    }
                  }}
                  style={({ pressed }) => [
                    styles.numKey,
                    {
                      backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.numKeyText, { color: colors.text }]}>{k}</Text>
                </Pressable>
              ))}
            </View>
            {errors.amount ? (
              <Text style={{ color: colors.danger, marginTop: 8 }}>{errors.amount}</Text>
            ) : null}
          </Card>

          {/* Réseau Mobile Money */}
          <SegmentedPicker
            label="Réseau de réception"
            value={network}
            onChange={setNetwork}
            options={mobileNetworks.map((n) => ({ value: n.id, label: n.name }))}
            renderItem={(opt, active) => {
              const net = mobileNetworks.find((n) => n.id === opt.value);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: net.color,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      color: active ? colors.textInverse : colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Text>
                </View>
              );
            }}
          />

          {/* Bénéficiaire */}
          <Card style={{ marginTop: spacing.sm }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Bénéficiaire</Text>
            <TextField
              label="Nom complet"
              placeholder="Aïssata Bah"
              value={receiverName}
              onChangeText={setReceiverName}
              error={errors.receiverName}
            />
            <TextField
              label="Numéro de téléphone"
              placeholder="+224 622 00 00 00"
              keyboardType="phone-pad"
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              error={errors.receiverPhone}
            />
          </Card>

          {/* Récapitulatif des frais */}
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Récapitulatif</Text>
            <Row label="Montant" value={formatCurrency(breakdown.amount, currency)} />
            <Row
              label="Frais de service"
              value={formatCurrency(breakdown.fees, currency)}
              hint="Variable selon réseau"
            />
            <Row
              label="Taux BCRG"
              value={`1 ${symbolOf(currency)} = ${rate.toLocaleString('fr-FR')} GNF`}
            />
            <View style={[styles.separator, { backgroundColor: colors.divider }]} />
            <Row
              label="Total débité"
              value={formatCurrency(breakdown.totalDebit, currency)}
              bold
            />
            <Row
              label="Bénéficiaire reçoit"
              value={formatCurrency(breakdown.receivedGNF, 'GNF')}
              bold
              tone={colors.primary}
            />
          </Card>

          {/* Avertissements KYC */}
          {validation.warnings.map((w, i) => (
            <View
              key={i}
              style={[
                styles.warning,
                { backgroundColor: colors.accentSoft, borderColor: colors.accent },
              ]}
            >
              <Ionicons name="warning" size={18} color={colors.accent} />
              <Text style={[styles.warningText, { color: colors.text }]}>{w}</Text>
            </View>
          ))}

          <PrimaryButton
            title={submitting ? 'Traitement…' : 'Confirmer le transfert'}
            onPress={submit}
            loading={submitting}
            disabled={!validation.valid}
            icon={
              <Ionicons name="shield-checkmark" size={18} color={colors.textInverse} />
            }
            style={{ marginTop: spacing.xl }}
          />
          <Text style={[styles.legal, { color: colors.textMuted }]}>
            Transaction conforme aux règles BCRG et AML/KYC en vigueur.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Row = ({ label, value, hint, bold, tone }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
        {hint ? (
          <Text style={[styles.rowHint, { color: colors.textMuted }]}>{hint}</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.rowValue,
          { color: tone || colors.text, fontWeight: bold ? '700' : '500' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: 0,
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

  amountLabel: { ...typography.tiny, textTransform: 'uppercase' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  currencyPrefix: { fontSize: 28, fontWeight: '700', marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  converterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  converterText: { ...typography.body },

  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  numKey: {
    width: '33.33%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  numKeyText: { fontSize: 22, fontWeight: '600' },

  cardTitle: { ...typography.h3, marginBottom: spacing.md },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: { ...typography.body },
  rowHint: { ...typography.small, marginTop: 2 },
  rowValue: { ...typography.h3 },
  separator: { height: 1, marginVertical: spacing.sm },

  warning: {
    flexDirection: 'row',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  warningText: { ...typography.small, flex: 1 },

  legal: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default TransferScreen;
