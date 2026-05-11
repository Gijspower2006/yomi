import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { usePro } from '../contexts/ProContext';

export default function AdBanner() {
  const colors = useColors();
  const { isPro, showPaywall } = usePro();

  if (isPro) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardAlt, borderTopColor: colors.border }]}>
      <View style={styles.adLabel}>
        <Text style={[styles.adLabelText, { color: colors.textLight }]}>AD</Text>
      </View>
      <Text style={[styles.adText, { color: colors.textSecondary }]}>
        🍜 Instant ramen — officially a study food
      </Text>
      <TouchableOpacity
        style={[styles.removeBtn, { borderColor: colors.border }]}
        onPress={showPaywall}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={13} color={colors.textLight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  adLabel: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  adLabelText: {
    fontSize: 9,
    fontFamily: 'NotoSansJP_700Bold',
    letterSpacing: 0.8,
  },
  adText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'NotoSansJP_400Regular',
  },
  removeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
