import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Message, AppSettings } from '../types';
import { sendMessage } from '../services/aiService';
import { speakMixed, stopSpeaking } from '../services/speech';

interface Props {
  settings: AppSettings;
}

const SUGGESTED = [
  'こんにちは！', 'How do I say "I\'m hungry"?', 'Teach me a new word',
  'What is ありがとう?', 'Correct my Japanese please', 'Give me a practice sentence',
];

function MessageBubble({ message, onSpeak }: { message: Message; onSpeak: (text: string) => void }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.userRow : styles.assistantRow]}>
      {!isUser && (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>先</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        {!isUser && (
          <TouchableOpacity style={styles.speakBtn} onPress={() => onSpeak(message.content)}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ConversationScreen({ settings }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'こんにちは！(Konnichiwa!) I\'m Yuki, your Japanese tutor 先生. How can I help you today? You can ask me anything in English or Japanese!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendMessage(messages, text.trim(), settings.level, settings.provider);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to get a response.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, settings]);

  const handleSpeak = useCallback((text: string) => {
    speakMixed(text);
  }, []);

  const clearChat = () => {
    Alert.alert('Clear Chat', 'Start a new conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          stopSpeaking();
          setMessages([{
            id: '0',
            role: 'assistant',
            content: 'こんにちは！New session started. What would you like to practice today?',
            timestamp: new Date(),
          }]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>先</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Yuki</Text>
            <Text style={styles.headerSubtitle}>AI Japanese Tutor · {settings.level}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.newBtn}>
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} onSpeak={handleSpeak} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>先</Text>
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Yuki is typing…</Text>
            </View>
          </View>
        )}

        {/* Suggested phrases */}
        {messages.length <= 2 && !loading && (
          <View>
            <Text style={styles.suggestedLabel}>Try asking:</Text>
            <FlatList
              horizontal
              data={SUGGESTED}
              keyExtractor={(s) => s}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestion} onPress={() => send(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedList}
            />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Yuki anything…"
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            blurOnSubmit
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.white,
  },
  headerTitle: { fontSize: 17, fontFamily: 'NotoSansJP_800ExtraBold', color: Colors.text, letterSpacing: -0.2 },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  newBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  newBtnText: { fontSize: 13, color: Colors.white, fontFamily: 'NotoSansJP_700Bold' },

  messageList: { padding: 16, paddingBottom: 8 },
  bubbleRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start', gap: 8 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: Colors.card, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: Colors.white },
  assistantText: { color: Colors.text },
  speakBtn: { marginTop: 8, alignSelf: 'flex-start' },
  speakIcon: { fontSize: 16 },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingText: { fontSize: 13, color: Colors.textSecondary },

  suggestedLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP_700Bold',
    color: Colors.textLight,
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  suggestedList: { paddingHorizontal: 16, gap: 8 },
  suggestion: {
    backgroundColor: Colors.card,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary + '40',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  suggestionText: { fontSize: 13, color: Colors.primary, fontFamily: 'NotoSansJP_500Medium' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { fontSize: 20, color: Colors.white, fontFamily: 'NotoSansJP_700Bold' },
});
