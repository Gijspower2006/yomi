import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { AppSettings } from '../types';
import { fetchLeaderboard, LeaderboardEntry } from '../services/leaderboardService';
import { useXP, computeLevel, LEVEL_NAMES } from '../hooks/useXP';
import { useStreak } from '../hooks/useStreak';

interface Props {
  settings: AppSettings;
}

type Tab = 'weekly' | 'total';

const MEDALS = ['🥇', '🥈', '🥉'];

function levelBadge(xp: number): string {
  const { level } = computeLevel(xp);
  return `Lv.${level}`;
}

export default function LeaderboardScreen({ settings }: Props) {
  const [tab, setTab] = useState<Tab>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { xp, weeklyXP } = useXP();
  const { streak } = useStreak();

  const load = useCallback(async (t: Tab, silent = false) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const data = await fetchLeaderboard(t);
      setEntries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab]);

  const onRefresh = () => {
    setRefreshing(true);
    load(tab, true);
  };

  const hasUsername = settings.username.trim().length > 0;
  const userXP = tab === 'weekly' ? weeklyXP : xp;
  const userRank = entries.findIndex(e => e.username === settings.username) + 1;
  const userOnBoard = userRank > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>競争ランキング</Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <View style={styles.tabSegment}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'weekly' && styles.tabBtnActive]}
            onPress={() => setTab('weekly')}
          >
            <Text style={[styles.tabText, tab === 'weekly' && styles.tabTextActive]}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'total' && styles.tabBtnActive]}
            onPress={() => setTab('total')}
          >
            <Text style={[styles.tabText, tab === 'total' && styles.tabTextActive]}>All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* No username prompt */}
      {!hasUsername && (
        <View style={styles.noUserBanner}>
          <Text style={styles.noUserText}>Set a player name in Settings to appear on the leaderboard</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load leaderboard.</Text>
          <Text style={styles.errorSub}>Check your backend connection.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load(tab)}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {entries.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No scores yet</Text>
              <Text style={styles.emptySub}>Complete a study session to appear here</Text>
            </View>
          )}

          {entries.map((entry, i) => {
            const isMe = entry.username === settings.username;
            const xpVal = tab === 'weekly' ? entry.weekly_xp : entry.total_xp;
            return (
              <View
                key={entry.username}
                style={[styles.row, isMe && styles.rowMe]}
              >
                <View style={styles.rankWrap}>
                  {i < 3 ? (
                    <Text style={styles.medal}>{MEDALS[i]}</Text>
                  ) : (
                    <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>{i + 1}</Text>
                  )}
                </View>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{entry.username[0]?.toUpperCase() ?? '?'}</Text>
                </View>

                <View style={styles.info}>
                  <Text style={[styles.username, isMe && styles.usernameMe]} numberOfLines={1}>
                    {entry.username}{isMe ? ' (you)' : ''}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.levelBadge}>{levelBadge(entry.total_xp)}</Text>
                    {entry.streak > 0 && (
                      <Text style={styles.streakText}>🔥 {entry.streak}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.xpWrap}>
                  <Text style={[styles.xpVal, isMe && styles.xpValMe]}>{xpVal.toLocaleString()}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            );
          })}

          {/* If user isn't on the board, show their own stats at the bottom */}
          {hasUsername && !userOnBoard && entries.length > 0 && (
            <>
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>YOU</Text>
                <View style={styles.separatorLine} />
              </View>
              <View style={[styles.row, styles.rowMe]}>
                <View style={styles.rankWrap}>
                  <Text style={styles.rankNum}>—</Text>
                </View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{settings.username[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.username, styles.usernameMe]} numberOfLines={1}>
                    {settings.username} (you)
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.levelBadge}>{levelBadge(xp)}</Text>
                    {streak > 0 && <Text style={styles.streakText}>🔥 {streak}</Text>}
                  </View>
                </View>
                <View style={styles.xpWrap}>
                  <Text style={[styles.xpVal, styles.xpValMe]}>{userXP.toLocaleString()}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 26, fontFamily: 'NotoSansJP_900Black', color: Colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary, marginTop: 2 },

  tabRow: {
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabSegment: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: 100,
    padding: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 100, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },

  noUserBanner: {
    backgroundColor: Colors.warning + '18',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warning + '44',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  noUserText: { fontSize: 12, color: Colors.warning, fontFamily: 'NotoSansJP_600SemiBold', textAlign: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  errorText: { fontSize: 16, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  errorSub: { fontSize: 13, color: Colors.textSecondary },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  retryBtnText: { color: Colors.white, fontFamily: 'NotoSansJP_700Bold', fontSize: 14 },

  scroll: { padding: 16, paddingBottom: 40 },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  rowMe: {
    borderWidth: 1.5,
    borderColor: Colors.primary + '66',
    backgroundColor: Colors.primary + '0D',
  },

  rankWrap: { width: 32, alignItems: 'center' },
  medal: { fontSize: 22 },
  rankNum: { fontSize: 16, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.textSecondary },
  rankNumMe: { color: Colors.primary },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.primary },

  info: { flex: 1 },
  username: { fontSize: 15, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  usernameMe: { color: Colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  levelBadge: { fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: Colors.textSecondary },
  streakText: { fontSize: 11, color: Colors.textSecondary },

  xpWrap: { alignItems: 'flex-end' },
  xpVal: { fontSize: 18, fontFamily: 'NotoSansJP_900Black', color: Colors.text },
  xpValMe: { color: Colors.primary },
  xpLabel: { fontSize: 10, fontFamily: 'NotoSansJP_700Bold', color: Colors.textLight, marginTop: 1 },

  separator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  separatorText: { fontSize: 10, fontFamily: 'NotoSansJP_700Bold', color: Colors.textLight, letterSpacing: 1.5 },
});
