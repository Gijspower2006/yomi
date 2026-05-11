import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5_KANJI, N5Kanji, KanjiCategory } from '../../data/n5kanji';

const CATEGORIES: { id: KanjiCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'time', label: 'Time' },
  { id: 'nature', label: 'Nature' },
  { id: 'people', label: 'People' },
  { id: 'direction', label: 'Direction' },
  { id: 'actions', label: 'Actions' },
  { id: 'things', label: 'Things' },
  { id: 'body', label: 'Body' },
];

interface Props {
  onBack: () => void;
  onSelectKanji: (k: N5Kanji) => void;
}

export default function KanjiScreen({ onBack, onSelectKanji }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<KanjiCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return N5_KANJI.filter(k => {
      const catMatch = activeCategory === 'all' || k.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        k.char.includes(q) ||
        k.meanings.some(m => m.toLowerCase().includes(q)) ||
        k.onyomi.some(r => r.toLowerCase().includes(q)) ||
        k.kunyomi.some(r => r.includes(q))
      );
    });
  }, [search, activeCategory]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>N5 Kanji</Text>
          <Text style={styles.headerSub}>{N5_KANJI.length} characters</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search kanji, meaning, reading…"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No kanji found</Text>
          </View>
        ) : (
          <View style={styles.gridInner}>
            {filtered.map(kanji => (
              <TouchableOpacity
                key={kanji.char}
                style={styles.card}
                onPress={() => onSelectKanji(kanji)}
                activeOpacity={0.80}
              >
                <Text style={styles.cardChar}>{kanji.char}</Text>
                <Text style={styles.cardMeaning} numberOfLines={1}>
                  {kanji.meanings[0]}
                </Text>
                <Text style={styles.cardReading} numberOfLines={1}>
                  {kanji.onyomi[0] ?? kanji.kunyomi[0] ?? ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { gap: 2 },
  headerTitle: { fontSize: 20, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },
  headerSub: { fontSize: 12, fontFamily: 'NotoSansJP_500Medium', color: Colors.textSecondary },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 14, marginBottom: 0,
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1, fontSize: 14,
    fontFamily: 'NotoSansJP_500Medium', color: Colors.text,
  },

  filterBar: { maxHeight: 54 },
  filterContent: {
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textSecondary,
  },
  filterChipTextActive: { color: '#fff' },

  grid: { paddingHorizontal: 14, paddingTop: 14 },
  gridInner: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  card: {
    width: '22%',
    flexGrow: 1,
    minWidth: 72,
    backgroundColor: Colors.card,
    borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardChar: {
    fontSize: 34, fontFamily: 'NotoSansJP_900Black', color: Colors.text, lineHeight: 40,
  },
  cardMeaning: {
    fontSize: 10, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardReading: {
    fontSize: 10, fontFamily: 'NotoSansJP_500Medium', color: Colors.textLight,
    textAlign: 'center',
  },

  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: 'NotoSansJP_500Medium', color: Colors.textLight },
});
