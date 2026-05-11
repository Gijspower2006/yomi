import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, FlatList, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { N5_WORDS, POSFilter } from '../../data/n5words';

const GAP = 14;
const PAD = 16;
const TILE_W = (Dimensions.get('window').width - PAD * 2 - GAP) / 2;

interface Props {
  level: string;
  onBack: () => void;
  onSelectCategory: (posFilter: POSFilter, title: string) => void;
}

const CATEGORIES: {
  key: POSFilter; label: string; decor: string; icon: keyof typeof Ionicons.glyphMap; color: string;
}[] = [
  { key: 'all',    label: 'All Words',      decor: '語', icon: 'library',          color: '#FF2D55' },
  { key: 'verb',   label: 'Verbs',          decor: '動', icon: 'flash',            color: '#FF6B00' },
  { key: 'i-adj',  label: 'I-Adjectives',   decor: '形', icon: 'color-palette',    color: '#C77DFF' },
  { key: 'na-adj', label: 'Na-Adjectives',  decor: '容', icon: 'sparkles',         color: '#4CC9F0' },
  { key: 'noun',   label: 'Nouns',          decor: '名', icon: 'pricetag',         color: '#F5C518' },
  { key: 'adverb', label: 'Adverbs & More', decor: '副', icon: 'swap-horizontal',  color: '#06D6A0' },
];

export default function CategoryScreen({ level, onBack, onSelectCategory }: Props) {
  const counts = useMemo(() => {
    const c: Partial<Record<POSFilter, number>> = { all: N5_WORDS.length };
    for (const w of N5_WORDS) {
      if (w.pos === 'verb')   c.verb      = (c.verb      ?? 0) + 1;
      if (w.pos === 'i-adj')  c['i-adj']  = (c['i-adj']  ?? 0) + 1;
      if (w.pos === 'na-adj') c['na-adj'] = (c['na-adj'] ?? 0) + 1;
      if (w.pos === 'noun')   c.noun      = (c.noun      ?? 0) + 1;
      if (!['verb','i-adj','na-adj','noun'].includes(w.pos))
        c.adverb = (c.adverb ?? 0) + 1;
    }
    return c;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Levels</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JLPT {level}</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const count = counts[item.key] ?? 0;
          return (
            <TouchableOpacity
              style={[
                styles.tileShadow,
                { shadowColor: item.color },
                index % 2 === 1 && styles.tileRight,
              ]}
              onPress={() => onSelectCategory(item.key, item.label)}
              activeOpacity={0.88}
            >
              <View style={[styles.tileInner, { backgroundColor: item.color }]}>
                <View style={styles.tileOrb} />
                <Text style={styles.tileGhost}>{item.decor}</Text>

                <View style={styles.tileCenter}>
                  <Ionicons name={item.icon} size={36} color="rgba(255,255,255,0.95)" />
                </View>

                <View style={styles.tileFooter}>
                  <Text style={styles.tileName} numberOfLines={1}>{item.label}</Text>
                  <View style={styles.tileCountPill}>
                    <Text style={styles.tileCountText}>{count}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 72 },
  backChevron: { fontSize: 26, color: Colors.primary, lineHeight: 30, marginRight: 2 },
  backLabel: { fontSize: 15, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.primary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text },

  grid: { padding: PAD, paddingBottom: 48, gap: GAP },

  tileShadow: {
    width: TILE_W,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  tileRight: { marginLeft: GAP },

  tileInner: {
    width: '100%',
    height: 168,
    borderRadius: 22,
    overflow: 'hidden',
  },

  tileOrb: {
    position: 'absolute', top: -28, left: -28,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tileGhost: {
    position: 'absolute', right: -10, bottom: 32,
    fontSize: 88, fontFamily: 'NotoSansJP_900Black',
    color: 'rgba(0,0,0,0.12)', lineHeight: 96,
  },

  tileCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 12 },

  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  tileName: { fontSize: 13, fontFamily: 'NotoSansJP_800ExtraBold', color: '#fff', flex: 1 },
  tileCountPill: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tileCountText: { fontSize: 11, fontFamily: 'NotoSansJP_700Bold', color: '#fff' },
});
