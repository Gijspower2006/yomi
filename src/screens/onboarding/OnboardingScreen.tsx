import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AppSettings } from '../../types';

interface Props {
  onComplete: (updates: Partial<AppSettings>) => void;
}

const MODES = [
  { icon: 'albums'          as const, label: 'Flashcards',   color: '#FF2D55' },
  { icon: 'radio-button-on' as const, label: 'Word Quiz',    color: '#4361EE' },
  { icon: 'document-text'   as const, label: 'Sentences',    color: '#06D6A0' },
  { icon: 'pencil'          as const, label: 'Translation',  color: '#9B5DE5' },
  { icon: 'headset'         as const, label: 'Listening',    color: '#F4A261' },
  { icon: 'text'            as const, label: 'Kana Trainer', color: '#4CC9F0' },
];

function useFade() {
  const opacity = useRef(new Animated.Value(0)).current;
  const fadeIn = () => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };
  return { opacity, fadeIn };
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const { opacity, fadeIn } = useFade();

  useEffect(() => { fadeIn(); }, [step]);

  const advance = () => setStep(s => s + 1);
  const finish  = () => onComplete({ username: username.trim(), onboarded: true });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.content, { opacity }]}>

        {step === 0 && (
          <View style={styles.slide}>
            <View style={styles.heroWrap}>
              <View style={styles.orbA} />
              <View style={styles.orbB} />
              <Text style={styles.heroKanji}>日</Text>
              <View style={styles.heroIconWrap}>
                <Text style={styles.heroIconText}>読</Text>
              </View>
            </View>
            <Text style={styles.appName}>Yomi</Text>
            <Text style={styles.tagline}>Master Japanese vocabulary{'\n'}one word at a time</Text>
            <View style={styles.featureList}>
              {[
                { icon: 'flash'   as const, text: 'Spaced repetition flashcards' },
                { icon: 'trophy'  as const, text: 'XP, levels & live leaderboard' },
                { icon: 'headset' as const, text: '6 study modes including listening' },
              ].map(f => (
                <View key={f.text} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={advance}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.slide}>
            <View style={styles.stepIconWrap}>
              <Ionicons name="person" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSub}>
              This appears on the leaderboard.{'\n'}You can change it later in Settings.
            </Text>
            <TextInput
              style={styles.nameInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter a display name…"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={() => username.trim() && advance()}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.primaryBtn, !username.trim() && styles.primaryBtnDisabled]}
              onPress={() => username.trim() && advance()}
              activeOpacity={username.trim() ? 0.8 : 1}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={advance}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.slide}>
            <View style={styles.stepIconWrap}>
              <Ionicons name="school" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>6 ways to learn</Text>
            <Text style={styles.stepSub}>Switch between modes anytime{'\n'}in the Study tab</Text>
            <View style={styles.modesGrid}>
              {MODES.map(m => (
                <View key={m.label} style={styles.modeChip}>
                  <View style={[styles.modeChipIcon, { backgroundColor: m.color + '22' }]}>
                    <Ionicons name={m.icon} size={18} color={m.color} />
                  </View>
                  <Text style={styles.modeChipLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={finish}>
              <Text style={styles.primaryBtnText}>Start Learning</Text>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },

  slide: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Welcome hero
  heroWrap: {
    width: 160, height: 160,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbA: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '18',
  },
  orbB: {
    position: 'absolute',
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.primary + '28',
  },
  heroKanji: {
    position: 'absolute',
    fontSize: 120,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.primary + '15',
    lineHeight: 140,
  },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  heroIconText: {
    fontSize: 44,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.white,
    lineHeight: 52,
  },

  appName: {
    fontSize: 48,
    fontFamily: 'NotoSansJP_900Black',
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  featureList: { width: '100%', gap: 12, marginBottom: 40 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.text,
    flex: 1,
  },

  // Step screens
  stepIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'NotoSansJP_800ExtraBold',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 14,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  nameInput: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'NotoSansJP_600SemiBold',
    color: Colors.text,
    marginBottom: 20,
  },

  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  modeChipIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  modeChipLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansJP_600SemiBold',
    color: Colors.text,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.white,
  },
  skipBtn: { marginTop: 14, padding: 8 },
  skipBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.textSecondary,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
});
