// Client Supabase configuré pour React Native
// AsyncStorage persiste la session entre les redémarrages de l'app
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Récupère les variables depuis app.json -> extra ou variables d'env Expo
const extra = Constants.expoConfig?.extra ?? {};

const RAW_URL = extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const RAW_KEY =
  extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Vérifie qu'on a une vraie URL Supabase (et pas un placeholder)
const isValidUrl = (s) =>
  typeof s === 'string' &&
  /^https?:\/\//.test(s) &&
  !s.includes('REMPLACER') &&
  !s.includes('placeholder');

const isValidKey = (s) =>
  typeof s === 'string' && s.length > 20 && !s.includes('REMPLACER');

export const supabaseReady = isValidUrl(RAW_URL) && isValidKey(RAW_KEY);

if (!supabaseReady) {
  console.warn(
    '[Supabase] Configuration manquante. Renseignez supabaseUrl et supabaseAnonKey dans app.json -> extra, puis redémarrez Expo.'
  );
}

// Fallback sur une URL syntaxiquement valide pour éviter le crash de createClient
// L'app démarre, mais les appels DB échoueront avec une erreur réseau claire
const SUPABASE_URL = isValidUrl(RAW_URL) ? RAW_URL : 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = isValidKey(RAW_KEY) ? RAW_KEY : 'placeholder-anon-key-not-configured';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
