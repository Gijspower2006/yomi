import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { speak } from '../services/ttsService';

interface Props {
  text: string;
  size?: number;
  color?: string;
}

export default function SpeakerButton({ text, size = 18, color = Colors.primary }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await speak(text);
    } catch {
      // silently fail — TTS is a nice-to-have
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.btn} activeOpacity={0.7} hitSlop={8}>
      {loading
        ? <ActivityIndicator size="small" color={color} />
        : <Ionicons name="volume-medium-outline" size={size} color={color} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4, alignItems: 'center', justifyContent: 'center' },
});
