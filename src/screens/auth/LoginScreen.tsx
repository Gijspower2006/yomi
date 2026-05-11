import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AuthUser } from '../../types';
import { login } from '../../services/authService';

interface Props {
  onAuth: (user: AuthUser) => void;
  onGoRegister: () => void;
}

export default function LoginScreen({ onAuth, onGoRegister }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError('');

    if (!identifier.trim()) { setError('Please enter your email or phone number.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      console.log('[Login] attempting login for', identifier.trim());
      const user = await login(identifier.trim(), password);
      console.log('[Login] success, user id:', user.id);
      onAuth(user);
    } catch (e: any) {
      console.error('[Login] error:', e);
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoOrb}>
              <View style={styles.logoOrbSheen} />
              <Text style={styles.logoKanji}>読</Text>
            </View>
            <Text style={styles.appName}>Yomi</Text>
            <Text style={styles.appSub}>Japanese · N5 to N1</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue your progress</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={t => { setIdentifier(t); setError(''); }}
                placeholder="Email or phone number"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textLight}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <>
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                  </>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onGoRegister}>
              <Text style={styles.footerLink}>Create one →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    gap: 20,
  },

  logoWrap: { alignItems: 'center', gap: 6, marginBottom: 8 },
  logoOrb: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55, shadowRadius: 20, elevation: 12,
    marginBottom: 4,
  },
  logoOrbSheen: {
    position: 'absolute', top: -20, right: -20,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logoKanji: {
    fontSize: 46, fontFamily: 'NotoSansJP_900Black',
    color: Colors.white, lineHeight: 54,
  },
  appName: {
    fontSize: 32, fontFamily: 'NotoSansJP_900Black',
    color: Colors.text, letterSpacing: 1,
  },
  appSub: {
    fontSize: 13, fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary, letterSpacing: 0.3,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.border,
    gap: 14,
  },
  cardTitle: {
    fontSize: 22, fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.text, letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 13, fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary, marginTop: -6, marginBottom: 4,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15,
    fontFamily: 'NotoSansJP_500Medium', color: Colors.text,
  },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '18',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.error,
  },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary,
    borderRadius: 14, height: 54,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  primaryBtnText: {
    fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.white,
  },

  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 4,
  },
  footerText: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary },
  footerLink: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.primary },
});
