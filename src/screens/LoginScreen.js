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
import { radius, spacing, typography, shadows } from '../theme';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { supabaseReady } from '../services/supabase';

const LoginScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { login, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    const e = {};
    if (!email.includes('@')) e.email = 'E-mail invalide';
    if (password.length < 6) e.password = '6 caractères minimum';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setTimeout(() => {
      login({ email, password });
      setSubmitting(false);
    }, 400);
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
          {/* Logo / branding */}
          <View
            style={[
              styles.logo,
              { backgroundColor: colors.primary },
              shadows(colors.primary + '55').card,
            ]}
          >
            <Ionicons name="paper-plane" size={36} color="#fff" />
          </View>
          <Text style={[styles.brand, { color: colors.text }]}>Diaspora Pay</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Transferts intelligents vers la Guinée
          </Text>

          {/* Bandeau d'avertissement si Supabase n'est pas configuré */}
          {!supabaseReady && (
            <View
              style={[
                styles.configBanner,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Ionicons name="warning" size={18} color={colors.accent} />
              <Text style={[styles.configText, { color: colors.text }]}>
                Supabase non configuré. Collez vos clés dans{' '}
                <Text style={{ fontWeight: '700' }}>app.json → extra</Text> puis
                relancez Expo.
              </Text>
            </View>
          )}

          {/* Formulaire */}
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Bon retour parmi nous 👋
            </Text>

            <TextField
              label="E-mail"
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (authError) clearAuthError();
              }}
              error={errors.email}
            />

            <View>
              <TextField
                label="Mot de passe"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (authError) clearAuthError();
                }}
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

            <Pressable style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
              <Text style={[styles.link, { color: colors.primary }]}>
                Mot de passe oublié ?
              </Text>
            </Pressable>

            {authError ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {authError}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              title={submitting ? 'Connexion…' : 'Se connecter'}
              onPress={submit}
              loading={submitting}
              icon={<Ionicons name="log-in-outline" size={18} color={colors.textInverse} />}
              style={{ marginTop: spacing.lg }}
            />

            {/* Démo helper */}
            <View
              style={[
                styles.demoBox,
                { backgroundColor: colors.primarySoft, borderColor: colors.primary + '33' },
              ]}
            >
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={[styles.demoText, { color: colors.primary }]}>
                Démo : demo@diaspora.gn / demo1234
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={{ color: colors.textMuted }}>Pas encore de compte ? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.link, { color: colors.primary, fontWeight: '700' }]}>
                Créer un compte
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  brand: { ...typography.display, textAlign: 'center' },
  tagline: { ...typography.body, textAlign: 'center', marginTop: 4 },

  title: { ...typography.h1, marginBottom: 4 },
  subtitle: { ...typography.body, marginBottom: spacing.lg },

  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 38,
    padding: 6,
  },

  link: { ...typography.small },

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

  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  demoText: { ...typography.small },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },

  configBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  configText: { ...typography.small, flex: 1, lineHeight: 18 },
});

export default LoginScreen;
