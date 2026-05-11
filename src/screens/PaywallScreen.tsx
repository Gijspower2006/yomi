import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, Dimensions, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { getLocalPrice } from '../utils/localPrice';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.80;

const FEATURES = [
  { icon: 'ban-outline',            text: 'No ads — ever' },
  { icon: 'heart-outline',          text: 'Support the app & keep it free for others' },
  { icon: 'flash-outline',          text: 'Faster load times without ad requests' },
  { icon: 'moon-outline',           text: 'Clean, distraction-free study sessions' },
  { icon: 'shield-checkmark-outline', text: 'No third-party tracking from ads' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PaywallScreen({ visible, onClose }: Props) {
  const colors = useColors();
  const { formatted: localPrice } = getLocalPrice();
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, height: SHEET_H },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <View style={[styles.iconBg, { backgroundColor: '#4361EE22' }]}>
              <Text style={styles.iconEmoji}>🚫</Text>
            </View>
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>Go Ad-Free</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Study Japanese without interruptions for less than a coffee a month
          </Text>

          {/* Feature list */}
          <View style={[styles.featureBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}
              >
                <View style={[styles.featureIconWrap, { backgroundColor: '#4361EE22' }]}>
                  <Ionicons name={f.icon as any} size={16} color="#4361EE" />
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>{f.text}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>{localPrice}</Text>
            <Text style={[styles.pricePer, { color: colors.textSecondary }]}> / month</Text>
          </View>
          <Text style={[styles.priceSub, { color: colors.textLight }]}>
            Cancel anytime · 7-day free trial
          </Text>

          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.88}>
            <Ionicons name="ban" size={18} color="#fff" />
            <Text style={styles.upgradeBtnText}>Remove Ads</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.dismissBtn}>
            <Text style={[styles.dismissText, { color: colors.textSecondary }]}>Keep ads for now</Text>
          </TouchableOpacity>

          <Text style={[styles.legal, { color: colors.textLight }]}>
            Payment processed by the App Store. Subscription auto-renews unless cancelled 24h before renewal.
          </Text>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, gap: 16 },

  iconWrap: { alignItems: 'center', marginTop: 8, marginBottom: 4 },
  iconBg: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 38 },

  heading: {
    fontSize: 28, fontFamily: 'NotoSansJP_900Black',
    textAlign: 'center', letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14, fontFamily: 'NotoSansJP_500Medium',
    textAlign: 'center', lineHeight: 20, marginTop: -8,
  },

  featureBox: {
    borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11, gap: 12,
  },
  featureIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: {
    flex: 1, fontSize: 13, fontFamily: 'NotoSansJP_500Medium',
  },

  priceRow: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'center', marginTop: 4,
  },
  price: { fontSize: 36, fontFamily: 'NotoSansJP_900Black', letterSpacing: -1 },
  pricePer: { fontSize: 16, fontFamily: 'NotoSansJP_500Medium' },
  priceSub: {
    fontSize: 12, fontFamily: 'NotoSansJP_400Regular',
    textAlign: 'center', marginTop: -8,
  },

  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#4361EE',
    borderRadius: 18, paddingVertical: 17,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 8,
  },
  upgradeBtnText: {
    fontSize: 17, fontFamily: 'NotoSansJP_800ExtraBold', color: '#fff',
  },

  dismissBtn: { alignItems: 'center', paddingVertical: 6 },
  dismissText: { fontSize: 14, fontFamily: 'NotoSansJP_500Medium' },

  legal: {
    fontSize: 10, fontFamily: 'NotoSansJP_400Regular',
    textAlign: 'center', lineHeight: 15,
  },
});
