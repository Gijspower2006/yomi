import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AuthUser } from '../../types';
import { register } from '../../services/authService';

interface Props {
  onAuth: (user: AuthUser) => void;
  onGoLogin: () => void;
}

export default function RegisterScreen({ onAuth, onGoLogin }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const identifierRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setError('');

    if (!displayName.trim()) { setError('Please enter a display name.'); return; }
    if (!identifier.trim()) { setError('Please enter your email or phone number.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      console.log('[Register] attempting register for', identifier.trim());
      const user = await register(identifier.trim(), password, displayName.trim());
      console.log('[Register] success, user id:', user.id);
      onAuth(user);
    } catch (e: any) {
      console.error('[Register] error:', e);
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
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onGoLogin} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.heading}>
            <Text style={styles.headingTitle}>Create account</Text>
            <Text style={styles.headingSub}>Start your Japanese journey today</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={t => { setDisplayName(t); setError(''); }}
                placeholder="Display name"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => identifierRef.current?.focus()}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                ref={identifierRef}
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
                placeholder="Password (min. 8 characters)"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textLight}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                ref={confirmRef}
                style={styles.input}
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); setError(''); }}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <>
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                  </>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text style={styles.footerLink}>Sign in →</Text>
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
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },

  topRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  heading: { gap: 4, marginTop: 8 },
  headingTitle: {
    fontSize: 28, fontFamily: 'NotoSansJP_900Black',
    color: Colors.text, letterSpacing: -0.5,
  },
  headingSub: {
    fontSize: 14, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.border,
    gap: 12,
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
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  footerText: { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary },
  footerLink: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.primary },
});
