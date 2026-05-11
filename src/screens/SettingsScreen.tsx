import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, SafeAreaView, Switch, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { usePro } from '../contexts/ProContext';
import { AppSettings, AuthUser, AppTheme, FontSize, ScriptPreference, AIProvider } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (s: Partial<AppSettings>) => void;
  onLogout?: () => void;
  authUser?: AuthUser | null;
}

// ── Segment control ──────────────────────────────────────────────────────────

function SegmentControl<T extends string>({
  options, value, onChange, colors,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[segStyles.track, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[segStyles.seg, active && { backgroundColor: colors.primary }]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[segStyles.label, { color: active ? colors.white : colors.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  seg: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'NotoSansJP_600SemiBold',
  },
});

// ── Row components ────────────────────────────────────────────────────────────

function SectionLabel({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={[rowStyles.sectionLabel, { color: colors.textLight }]}>
      {title}
    </Text>
  );
}

function RowDivider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[rowStyles.divider, { backgroundColor: colors.border }]} />;
}

function ToggleRow({
  icon, title, subtitle, value, onChange, colors,
}: {
  icon: string; title: string; subtitle?: string; value: boolean;
  onChange: (v: boolean) => void; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[rowStyles.row, { paddingVertical: 12 }]}>
      <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
      <View style={rowStyles.body}>
        <Text style={[rowStyles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[rowStyles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

function PressRow({
  icon, title, subtitle, onPress, destructive, colors,
}: {
  icon: string; title: string; subtitle?: string; onPress: () => void;
  destructive?: boolean; colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={20} color={destructive ? colors.error : colors.textSecondary} />
      <View style={rowStyles.body}>
        <Text style={[rowStyles.title, { color: destructive ? colors.error : colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[rowStyles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {!destructive && <Ionicons name="chevron-forward" size={16} color={colors.textLight} />}
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  body: { flex: 1 },
  title: { fontSize: 15, fontFamily: 'NotoSansJP_600SemiBold' },
  subtitle: { fontSize: 12, marginTop: 2 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen({ settings, onSave, onLogout, authUser }: Props) {
  const colors = useColors();
  const { isPro, showPaywall } = usePro();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const card = [styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.pageHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── ACCOUNT ── */}
        <SectionLabel title="ACCOUNT" colors={colors} />
        <View style={card}>
          <View style={rowStyles.row}>
            <Ionicons name="person-circle-outline" size={22} color={colors.textSecondary} />
            <View style={rowStyles.body}>
              <Text style={[rowStyles.title, { color: colors.text }]}>
                {authUser?.displayName?.trim() || settings.username || '—'}
              </Text>
              {authUser?.identifier ? (
                <Text style={[rowStyles.subtitle, { color: colors.textSecondary }]}>
                  {authUser.identifier}
                </Text>
              ) : null}
            </View>
          </View>

          {onLogout && (
            <>
              <RowDivider colors={colors} />
              {confirmLogout ? (
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmText, { color: colors.text }]}>Sign out of your account?</Text>
                  <View style={styles.confirmBtns}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: colors.border }]}
                      onPress={() => setConfirmLogout(false)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.logoutBtn, { backgroundColor: colors.error + '22', borderColor: colors.error + '55' }]}
                      onPress={onLogout}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.logoutBtnText, { color: colors.error }]}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <PressRow
                  icon="log-out-outline"
                  title="Sign Out"
                  onPress={() => setConfirmLogout(true)}
                  destructive
                  colors={colors}
                />
              )}
            </>
          )}
        </View>

        {/* ── YOMI PRO ── */}
        {!isPro && (
          <>
            <SectionLabel title="YOMI PRO" colors={colors} />
            <View style={card}>
              <PressRow
                icon="ban-outline"
                title="Remove Ads"
                subtitle="Study without interruptions"
                onPress={showPaywall}
                colors={colors}
              />
            </View>
          </>
        )}

        {/* ── APPEARANCE ── */}
        <SectionLabel title="APPEARANCE" colors={colors} />
        <View style={card}>
          <View style={[rowStyles.row, { paddingBottom: 8 }]}>
            <Ionicons name="color-palette-outline" size={20} color={colors.textSecondary} />
            <Text style={[rowStyles.title, { color: colors.text }]}>Theme</Text>
          </View>
          <SegmentControl<AppTheme>
            options={[
              { value: 'dark',  label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'oled',  label: 'OLED' },
            ]}
            value={settings.theme ?? 'dark'}
            onChange={(v) => onSave({ theme: v })}
            colors={colors}
          />

          <RowDivider colors={colors} />

          <View style={[rowStyles.row, { paddingBottom: 8 }]}>
            <Ionicons name="text-outline" size={20} color={colors.textSecondary} />
            <Text style={[rowStyles.title, { color: colors.text }]}>Font Size</Text>
          </View>
          <SegmentControl<FontSize>
            options={[
              { value: 'small',  label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large',  label: 'Large' },
            ]}
            value={settings.fontSize ?? 'medium'}
            onChange={(v) => onSave({ fontSize: v })}
            colors={colors}
          />
        </View>

        {/* ── LEARNING ── */}
        <SectionLabel title="LEARNING" colors={colors} />
        <View style={card}>
          <View style={[rowStyles.row, { paddingBottom: 8 }]}>
            <Ionicons name="language-outline" size={20} color={colors.textSecondary} />
            <Text style={[rowStyles.title, { color: colors.text }]}>Script Preference</Text>
          </View>
          <SegmentControl<ScriptPreference>
            options={[
              { value: 'romaji',   label: 'Romaji' },
              { value: 'hiragana', label: 'Kana' },
              { value: 'mixed',    label: 'Mixed' },
              { value: 'kanji',    label: 'Kanji' },
            ]}
            value={settings.scriptPreference}
            onChange={(v) => onSave({ scriptPreference: v })}
            colors={colors}
          />

          <RowDivider colors={colors} />

          <ToggleRow
            icon="book-outline"
            title="Show Romaji"
            subtitle="Pronunciation guides under Japanese text"
            value={settings.showRomaji}
            onChange={(v) => onSave({ showRomaji: v })}
            colors={colors}
          />

          <RowDivider colors={colors} />

          <ToggleRow
            icon="volume-high-outline"
            title="Auto-play Audio"
            subtitle="Play pronunciation when cards flip"
            value={settings.autoPlayAudio}
            onChange={(v) => onSave({ autoPlayAudio: v })}
            colors={colors}
          />

          <RowDivider colors={colors} />

          <View style={[rowStyles.row, { paddingBottom: 8 }]}>
            <Ionicons name="layers-outline" size={20} color={colors.textSecondary} />
            <View style={rowStyles.body}>
              <Text style={[rowStyles.title, { color: colors.text }]}>New Cards per Session</Text>
              <Text style={[rowStyles.subtitle, { color: colors.textSecondary }]}>
                How many new cards to introduce each study session
              </Text>
            </View>
          </View>
          <SegmentControl<string>
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '30', label: '30' },
              { value: '50', label: '50' },
            ]}
            value={String(settings.newCardsPerSession ?? 20)}
            onChange={(v) => onSave({ newCardsPerSession: parseInt(v, 10) })}
            colors={colors}
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  pageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'NotoSansJP_800ExtraBold',
    letterSpacing: -0.3,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },

  providerHint: {
    fontSize: 11,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  confirmRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  confirmText: { fontSize: 14, fontFamily: 'NotoSansJP_500Medium' },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, height: 40, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontFamily: 'NotoSansJP_600SemiBold' },
  logoutBtn: {
    flex: 1, height: 40, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  logoutBtnText: { fontSize: 14, fontFamily: 'NotoSansJP_600SemiBold' },

  bottomPad: { height: 40 },
});
