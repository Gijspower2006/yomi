import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { VocabWord, VocabCategory, AppSettings } from '../types';
import { VOCABULARY, CATEGORY_LABELS } from '../constants/vocabulary';
import { speakJapanese } from '../services/speech';
import { getWordExplanation } from '../services/aiService';

interface Props {
  settings: AppSettings;
}

const CATEGORIES: VocabCategory[] = ['greetings', 'numbers', 'food', 'travel', 'family', 'time', 'colors', 'verbs'];

function WordCard({ word, showRomaji, onPress }: { word: VocabWord; showRomaji: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.wordCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.wordCardTop}>
        <Text style={styles.wordJapanese}>{word.japanese}</Text>
        <TouchableOpacity onPress={() => speakJapanese(word.hiragana)} style={styles.speakBtn}>
          <Text style={styles.speakIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      {showRomaji && <Text style={styles.wordRomaji}>{word.romaji}</Text>}
      <Text style={styles.wordEnglish}>{word.english}</Text>
    </TouchableOpacity>
  );
}

function WordDetailModal({
  word,
  visible,
  onClose,
  settings,
}: {
  word: VocabWord | null;
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
}) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const loadExplanation = useCallback(async () => {
    if (!word) return;
    setLoading(true);
    setExplanation('');
    try {
      const text = await getWordExplanation(word.japanese, word.romaji, word.english, settings.level, settings.provider);
      setExplanation(text);
    } catch (e: any) {
      setExplanation('Could not load explanation. Check your API key in Settings.');
    } finally {
      setLoading(false);
    }
  }, [word, settings]);

  React.useEffect(() => {
    if (visible && word) loadExplanation();
  }, [visible, word]);

  if (!word) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalCategory}>{CATEGORY_LABELS[word.category]}</Text>
        </View>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Main word display */}
          <View style={styles.modalWordBlock}>
            <Text style={styles.modalJapanese}>{word.japanese}</Text>
            <Text style={styles.modalRomaji}>{word.romaji}</Text>
            <Text style={styles.modalEnglish}>{word.english}</Text>
            <TouchableOpacity style={styles.modalSpeakBtn} onPress={() => speakJapanese(word.hiragana)}>
              <Text style={styles.modalSpeakText}>🔊  Hear pronunciation</Text>
            </TouchableOpacity>
          </View>

          {/* Hiragana */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hiragana</Text>
            <Text style={styles.infoValue}>{word.hiragana}</Text>
          </View>

          {/* Example sentences */}
          {word.exampleEn && (
            <View style={styles.exampleBlock}>
              <Text style={styles.infoLabel}>Example</Text>
              <Text style={styles.exampleJa}>{word.exampleJa}</Text>
              <Text style={styles.exampleEn}>{word.exampleEn}</Text>
              {word.exampleJa && (
                <TouchableOpacity onPress={() => speakJapanese(word.exampleJa!)}>
                  <Text style={styles.speakSmall}>🔊 Hear example</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* AI explanation */}
          <View style={styles.aiBlock}>
            <Text style={styles.aiTitle}>✨ AI Explanation</Text>
            {loading ? (
              <View style={styles.aiLoading}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.aiLoadingText}>Getting explanation…</Text>
              </View>
            ) : (
              <Text style={styles.aiText}>{explanation}</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function VocabularyScreen({ settings }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory>('greetings');
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = VOCABULARY.filter((w) => w.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vocabulary 単語</Text>
        <Text style={styles.headerCount}>{VOCABULARY.length} words</Text>
      </View>

      {/* Category tabs */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryTab, selectedCategory === item && styles.categoryTabActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.categoryTabText, selectedCategory === item && styles.categoryTabTextActive]}>
              {CATEGORY_LABELS[item].split(' ')[0]}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Category title */}
      <Text style={styles.categoryTitle}>{CATEGORY_LABELS[selectedCategory]}</Text>

      {/* Word grid */}
      <FlatList
        data={filtered}
        keyExtractor={(w) => w.id}
        numColumns={2}
        renderItem={({ item }) => (
          <WordCard
            word={item}
            showRomaji={settings.showRomaji}
            onPress={() => {
              setSelectedWord(item);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.wordGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />

      <WordDetailModal
        word={selectedWord}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        settings={settings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontFamily: 'NotoSansJP_700Bold', color: Colors.text },
  headerCount: { fontSize: 13, color: Colors.textSecondary },

  categoryList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryTabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'NotoSansJP_500Medium' },
  categoryTabTextActive: { color: Colors.white, fontFamily: 'NotoSansJP_600SemiBold' },

  categoryTitle: { fontSize: 15, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.textSecondary, paddingHorizontal: 20, marginBottom: 8 },

  wordGrid: { padding: 12, paddingBottom: 32 },
  columnWrapper: { gap: 10 },
  wordCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  wordCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wordJapanese: { fontSize: 22, fontFamily: 'NotoSansJP_700Bold', color: Colors.text, flex: 1 },
  speakBtn: { padding: 4 },
  speakIcon: { fontSize: 16 },
  wordRomaji: { fontSize: 12, color: Colors.primary, marginTop: 4, fontStyle: 'italic' },
  wordEnglish: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeBtnText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold' },
  modalCategory: { fontSize: 15, fontFamily: 'NotoSansJP_600SemiBold', color: Colors.primary },
  modalScroll: { flex: 1 },
  modalWordBlock: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  modalJapanese: { fontSize: 52, color: Colors.white, fontFamily: 'NotoSansJP_800ExtraBold' },
  modalRomaji: { fontSize: 20, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  modalEnglish: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  modalSpeakBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalSpeakText: { color: Colors.white, fontSize: 14, fontFamily: 'NotoSansJP_600SemiBold' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'NotoSansJP_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, color: Colors.text, fontFamily: 'NotoSansJP_500Medium' },
  exampleBlock: { margin: 20, padding: 16, backgroundColor: Colors.card, borderRadius: 16 },
  exampleJa: { fontSize: 18, color: Colors.text, fontFamily: 'NotoSansJP_600SemiBold', marginTop: 8 },
  exampleEn: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  speakSmall: { fontSize: 13, color: Colors.primary, marginTop: 8 },
  aiBlock: { margin: 20, padding: 16, backgroundColor: Colors.cardAlt, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary + '20' },
  aiTitle: { fontSize: 14, fontFamily: 'NotoSansJP_700Bold', color: Colors.primary, marginBottom: 10 },
  aiNoKey: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiLoadingText: { fontSize: 14, color: Colors.textSecondary },
  aiText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
});
