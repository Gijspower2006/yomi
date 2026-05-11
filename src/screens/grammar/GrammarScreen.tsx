import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { GRAMMAR_PATTERNS, GrammarPattern, GrammarCategory } from '../../data/grammar';

interface Props {
  onSelect: (pattern: GrammarPattern) => void;
}

const CATEGORIES: { key: GrammarCategory | 'all'; label: string; jp: string }[] = [
  { key: 'all',              label: 'All',         jp: '全' },
  { key: 'particles',        label: 'Particles',   jp: '助' },
  { key: 'verb-forms',       label: 'Verb Forms',  jp: '動' },
  { key: 'expressions',      label: 'Expressions', jp: '表' },
  { key: 'sentence-patterns',label: 'Patterns',    jp: '文' },
];

const CATEGORY_COLORS: Record<GrammarCategory, string> = {
  'particles':         '#4361EE',
  'verb-forms':        '#FF2D55',
  'expressions':       '#06D6A0',
  'sentence-patterns': '#9B5DE5',
};

export default function GrammarScreen({ onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<GrammarCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = activeCategory === 'all'
      ? GRAMMAR_PATTERNS
      : GRAMMAR_PATTERNS.filter(p => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.explanation.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grammar</Text>
        <Text style={styles.headerSub}>JLPT N5 · {GRAMMAR_PATTERNS.length} patterns</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search patterns…"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          const color = cat.key === 'all' ? Colors.primary : CATEGORY_COLORS[cat.key as GrammarCategory];
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.catJp, active && styles.catJpActive]}>{cat.jp}</Text>
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No patterns found</Text>
          </View>
        )}
        {filtered.map(pattern => {
          const color = CATEGORY_COLORS[pattern.category];
          return (
            <TouchableOpacity
              key={pattern.id}
              style={styles.card}
              onPress={() => onSelect(pattern)}
              activeOpacity={0.78}
            >
              <View style={[styles.cardAccent, { backgroundColor: color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{pattern.title}</Text>
                  <View style={[styles.cardBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.cardBadgeText, { color }]}>
                      {CATEGORIES.find(c => c.key === pattern.category)?.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardSub}>{pattern.subtitle}</Text>
                <Text style={styles.cardFormula} numberOfLines={1}>{pattern.formula}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'NotoSansJP_500Medium',
    color: Colors.text,
  },

  catRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catJp: { fontSize: 13, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.textSecondary },
  catJpActive: { color: Colors.white },
  catLabel: { fontSize: 12, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textSecondary },
  catLabelActive: { color: Colors.white },

  scroll: { padding: 16, paddingBottom: 40, gap: 10 },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  cardTitle: { fontSize: 17, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  cardBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cardBadgeText: { fontSize: 10, fontFamily: 'NotoSansJP_700Bold' },
  cardSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium', marginBottom: 4 },
  cardFormula: { fontSize: 11, color: Colors.textLight, fontFamily: 'NotoSansJP_400Regular' },
});
