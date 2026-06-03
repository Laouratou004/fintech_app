import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { radius, spacing, typography } from '../theme';
import { countries } from '../data/countries';

import TextField from '../components/TextField';
import SegmentedPicker from '../components/SegmentedPicker';
import PrimaryButton from '../components/PrimaryButton';

const SignupScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { signup, authError, clearAuthError } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'France',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (authError) clearAuthError();
  };

  const submit = () => {
    const e = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Nom complet requis';
    if (!form.email.includes('@')) e.email = 'E-mail invalide';
    if (form.phone.replace(/\D/g, '').length < 8) e.phone = 'Téléphone invalide';
    if (form.password.length < 6) e.password = '6 caractères minimum';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    if (!acceptTerms) e.terms = 'Vous devez accepter les conditions';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setTimeout(() => {
      signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
      });
      setSubmitting(false);
    }, 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Rejoignez la diaspora et envoyez en toute sécurité.
          </Text>

          <TextField
            label="Nom complet"
            placeholder="Mamadou Diallo"
            value={form.fullName}
            onChangeText={(v) => set('fullName', v)}
            error={errors.fullName}
          />

          <TextField
            label="E-mail"
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            error={errors.email}
          />

          <TextField
            label="Téléphone"
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => set('phone', v)}
            error={errors.phone}
          />

          <SegmentedPicker
            label="Pays de résidence"
            value={form.country}
            onChange={(v) => set('country', v)}
            options={countries.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
          />

          <View>
            <TextField
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(v) => set('password', v)}
              error={errors.password}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              style={styles.eyeBtn}
              hitSlop={10}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          <TextField
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={form.confirm}
            onChangeText={(v) => set('confirm', v)}
            error={errors.confirm}
          />

          {/* Acceptation conditions */}
          <Pressable
            onPress={() => setAcceptTerms((v) => !v)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptTerms ? colors.primary : 'transparent',
                  borderColor: acceptTerms ? colors.primary : colors.border,
                },
              ]}
            >
              {acceptTerms ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : null}
            </View>
            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              J'accepte les{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                conditions d'utilisation
              </Text>{' '}
              et la conformité AML/KYC de la BCRG.
            </Text>
          </Pressable>
          {errors.terms ? (
            <Text style={{ color: colors.danger, marginTop: 4, marginLeft: 32, ...typography.small }}>
              {errors.terms}
            </Text>
          ) : null}

          {authError ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{authError}</Text>
            </View>
          ) : null}

          <PrimaryButton
            title={submitting ? 'Création…' : 'Créer mon compte'}
            onPress={submit}
            loading={submitting}
            icon={<Ionicons name="person-add" size={18} color={colors.textInverse} />}
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.footer}>
            <Text style={{ color: colors.textMuted }}>Déjà un compte ? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={[styles.link, { color: colors.primary, fontWeight: '700' }]}>
                Se connecter
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { ...typography.display, marginBottom: 4 },
  subtitle: { ...typography.body, marginBottom: spacing.lg },

  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 38,
    padding: 6,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  termsText: { ...typography.small, flex: 1, lineHeight: 18 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  errorText: { ...typography.small, flex: 1 },

  link: { ...typography.small },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});

export default SignupScreen;
