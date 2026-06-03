import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { radius, spacing, typography, shadows } from '../theme';
import Card from '../components/Card';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/currencyUtils';
import { currencies } from '../data/countries';

// Libellés des langues disponibles
const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

const ProfileScreen = () => {
  const { colors, isDark, setMode } = useTheme();
  const { user, logout, updateProfile } = useAuth();

  // États locaux pour les modales
  const [editProfile, setEditProfile] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  if (!user) return null;

  // ─────── Actions ───────
  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Souhaitez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  // Ouvre la modale d'édition du profil pré-remplie
  const openEditProfile = () => {
    setEditForm({
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
    });
    setEditProfile(true);
  };

  const saveEditProfile = () => {
    if (editForm.fullName.trim().length < 2) {
      Alert.alert('Erreur', 'Nom invalide');
      return;
    }
    updateProfile({
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim().toLowerCase(),
    });
    setEditProfile(false);
    Alert.alert('Succès', 'Profil mis à jour');
  };

  // Sélecteur de langue via Alert (style action-sheet)
  const pickLanguage = () => {
    const buttons = LANGUAGES.map((l) => ({
      text: l.label,
      onPress: () => updateProfile({ language: l.code }),
    }));
    buttons.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert('Choisir la langue', undefined, buttons);
  };

  const pickCurrency = () => {
    const buttons = currencies
      .filter((c) => c.code !== 'GNF')
      .map((c) => ({
        text: `${c.symbol}  ${c.name}`,
        onPress: () => updateProfile({ preferredCurrency: c.code }),
      }));
    buttons.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert('Devise par défaut', undefined, buttons);
  };

  const toggleNotifications = (v) => updateProfile({ notificationsEnabled: v });
  const toggleBiometric = (v) => {
    if (v) {
      Alert.alert(
        'Authentification biométrique',
        'Confirmez l’activation du Face ID / empreinte digitale.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Activer', onPress: () => updateProfile({ biometricEnabled: true }) },
        ]
      );
    } else {
      updateProfile({ biometricEnabled: false });
    }
  };

  // PIN: ouverture / sauvegarde
  const openPin = () => {
    setPinValue('');
    setPinConfirm('');
    setPinError('');
    setPinModal(true);
  };
  const savePin = () => {
    if (pinValue.length !== 4 || !/^\d{4}$/.test(pinValue)) {
      setPinError('Le code doit contenir 4 chiffres');
      return;
    }
    if (pinValue !== pinConfirm) {
      setPinError('Les codes ne correspondent pas');
      return;
    }
    updateProfile({ pin: pinValue });
    setPinModal(false);
    Alert.alert('Succès', 'Code PIN enregistré');
  };

  const showKyc = () => {
    const status =
      user.kycLevel === 'verified'
        ? 'Votre identité a été vérifiée. Plafond mensuel actif.'
        : 'Vérification en cours. Téléchargez votre pièce d’identité pour finaliser.';
    Alert.alert('Documents KYC', status, [
      { text: 'OK' },
      user.kycLevel !== 'verified' && {
        text: 'Téléverser',
        onPress: () =>
          Alert.alert('Téléversement', 'Fonctionnalité bientôt disponible'),
      },
    ].filter(Boolean));
  };

  const showPaymentMethods = () => {
    Alert.alert(
      'Méthodes de paiement',
      'Aucune méthode enregistrée.\nVous pourrez bientôt ajouter une carte bancaire, Apple Pay ou Google Pay.',
      [{ text: 'OK' }]
    );
  };

  const showPrivacy = () => {
    Alert.alert(
      'Confidentialité',
      'Vos données sont chiffrées et stockées conformément à la réglementation BCRG et au RGPD.',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'Centre d’aide',
      'FAQ:\n• Comment envoyer un transfert ?\n• Délai de réception\n• Taux de change BCRG\n• Sécurité du compte',
      [
        { text: 'Fermer' },
        {
          text: 'Voir la FAQ',
          onPress: () =>
            Linking.openURL('https://www.bcrg-guinee.org/').catch(() => {}),
        },
      ]
    );
  };

  const contactSupport = () => {
    Alert.alert('Nous contacter', 'Comment souhaitez-vous nous joindre ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'E-mail',
        onPress: () => Linking.openURL('mailto:support@diasporapay.gn').catch(() => {}),
      },
      {
        text: 'Téléphone',
        onPress: () => Linking.openURL('tel:+224622000000').catch(() => {}),
      },
    ]);
  };

  const showTerms = () => {
    Alert.alert(
      'Conditions d’utilisation',
      'En utilisant Diaspora Pay, vous acceptez :\n• Les règles AML/KYC de la BCRG\n• Les frais affichés avant chaque transfert\n• Le plafond mensuel applicable à votre profil',
      [{ text: 'J’ai compris' }]
    );
  };

  // ─────── Helpers d'affichage ───────
  const currentLanguage =
    LANGUAGES.find((l) => l.code === user.language) || LANGUAGES[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        <Text style={[styles.title, { color: colors.text }]}>Mon profil</Text>

        {/* Carte profil */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.primary },
            shadows(colors.primary + '55').card,
          ]}
        >
          <View style={styles.profileTop}>
            <View style={[styles.avatarLg, { backgroundColor: '#ffffff33' }]}>
              <Text style={styles.avatarLgText}>{user.avatarInitials}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.kycChip}>
                <Ionicons
                  name={user.kycLevel === 'verified' ? 'shield-checkmark' : 'time'}
                  size={12}
                  color="#fff"
                />
                <Text style={styles.kycChipText}>
                  KYC {user.kycLevel === 'verified' ? 'Vérifié' : 'En attente'}
                </Text>
              </View>
            </View>
            <Pressable onPress={openEditProfile} style={styles.editBtn} hitSlop={10}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.profileStats}>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileStatLabel}>Utilisé ce mois</Text>
              <Text style={styles.profileStatValue}>
                {formatCurrency(user.monthlyUsed, user.preferredCurrency)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileStatLabel}>Plafond</Text>
              <Text style={styles.profileStatValue}>
                {formatCurrency(user.monthlyLimit, user.preferredCurrency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Compte */}
        <SectionTitle text="Compte" />
        <Card>
          <Row icon="person-outline" label="Informations personnelles" onPress={openEditProfile} />
          <Divider />
          <Row icon="card-outline" label="Méthodes de paiement" onPress={showPaymentMethods} />
          <Divider />
          <Row
            icon="document-text-outline"
            label="Documents KYC"
            hint={user.kycLevel === 'verified' ? 'Vérifié' : 'En attente'}
            onPress={showKyc}
          />
        </Card>

        {/* Préférences */}
        <SectionTitle text="Préférences" />
        <Card>
          <SwitchRow
            icon="moon-outline"
            label="Mode sombre"
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
          />
          <Divider />
          <Row
            icon="language-outline"
            label="Langue"
            hint={currentLanguage.label}
            onPress={pickLanguage}
          />
          <Divider />
          <Row
            icon="cash-outline"
            label="Devise par défaut"
            hint={user.preferredCurrency}
            onPress={pickCurrency}
          />
          <Divider />
          <SwitchRow
            icon="notifications-outline"
            label="Notifications"
            value={user.notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </Card>

        {/* Sécurité */}
        <SectionTitle text="Sécurité" />
        <Card>
          <SwitchRow
            icon="finger-print-outline"
            label="Authentification biométrique"
            value={user.biometricEnabled}
            onValueChange={toggleBiometric}
          />
          <Divider />
          <Row
            icon="lock-closed-outline"
            label="Code PIN"
            hint={user.pin ? 'Défini' : 'Non défini'}
            onPress={openPin}
          />
          <Divider />
          <Row icon="shield-outline" label="Confidentialité" onPress={showPrivacy} />
        </Card>

        {/* Support */}
        <SectionTitle text="Support" />
        <Card>
          <Row icon="help-circle-outline" label="Centre d'aide" onPress={showHelp} />
          <Divider />
          <Row icon="chatbubble-ellipses-outline" label="Nous contacter" onPress={contactSupport} />
          <Divider />
          <Row icon="document-outline" label="Conditions d'utilisation" onPress={showTerms} />
        </Card>

        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logout,
            {
              borderColor: colors.danger,
              backgroundColor: colors.dangerSoft,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Se déconnecter</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.textMuted }]}>
          Diaspora Pay • v1.0.0 MVP
        </Text>
      </ScrollView>

      {/* ─────── Modale: édition profil ─────── */}
      <Modal visible={editProfile} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Informations personnelles
              </Text>
              <Pressable onPress={() => setEditProfile(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <TextField
              label="Nom complet"
              value={editForm.fullName}
              onChangeText={(v) => setEditForm({ ...editForm, fullName: v })}
            />
            <TextField
              label="Téléphone"
              keyboardType="phone-pad"
              value={editForm.phone}
              onChangeText={(v) => setEditForm({ ...editForm, phone: v })}
            />
            <TextField
              label="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={editForm.email}
              onChangeText={(v) => setEditForm({ ...editForm, email: v })}
            />
            <PrimaryButton
              title="Enregistrer"
              onPress={saveEditProfile}
              icon={<Ionicons name="checkmark" size={18} color={colors.textInverse} />}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─────── Modale: code PIN ─────── */}
      <Modal visible={pinModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {user.pin ? 'Modifier le code PIN' : 'Définir un code PIN'}
              </Text>
              <Pressable onPress={() => setPinModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <TextField
              label="Nouveau code PIN (4 chiffres)"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinValue}
              onChangeText={(v) => {
                setPinValue(v.replace(/\D/g, ''));
                setPinError('');
              }}
            />
            <TextField
              label="Confirmer le code"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinConfirm}
              onChangeText={(v) => {
                setPinConfirm(v.replace(/\D/g, ''));
                setPinError('');
              }}
              error={pinError}
            />
            <PrimaryButton
              title="Enregistrer"
              onPress={savePin}
              icon={<Ionicons name="lock-closed" size={18} color={colors.textInverse} />}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// ─────── Sous-composants ───────
const SectionTitle = ({ text }) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
      {text.toUpperCase()}
    </Text>
  );
};

// Ligne cliquable avec icône, label, indication optionnelle et chevron
const Row = ({ icon, label, hint, onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowItem,
        { backgroundColor: pressed ? colors.surfaceAlt : 'transparent', borderRadius: radius.sm },
      ]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={icon} size={18} color={colors.text} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {hint ? (
          <Text style={{ color: colors.textMuted, ...typography.small }}>{hint}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

// Ligne contenant un Switch
const SwitchRow = ({ icon, label, value, onValueChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.rowItem}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={icon} size={18} color={colors.text} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
};

const Divider = () => {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 4 }} />;
};

const styles = StyleSheet.create({
  title: { ...typography.display, marginBottom: spacing.lg },

  profileCard: { borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl },
  profileTop: { flexDirection: 'row', alignItems: 'center' },
  avatarLg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileEmail: { color: '#ffffffcc', marginTop: 2 },
  kycChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  kycChipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ffffff22',
  },
  profileStatLabel: { color: '#ffffffaa', fontSize: 11, fontWeight: '600' },
  profileStatValue: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 4 },

  sectionTitle: {
    ...typography.tiny,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, flexShrink: 1 },

  logout: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  logoutText: { ...typography.h3 },

  version: { textAlign: 'center', marginTop: spacing.lg, ...typography.small },

  // Modales
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

export default ProfileScreen;
