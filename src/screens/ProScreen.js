import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';

const FEATURES = [
  { icon: '🚫', label: 'Remove all ads',          desc: 'Clean, distraction-free experience' },
  { icon: '⭐', label: 'Support development',      desc: 'Help us build more tools' },
  { icon: '🚀', label: 'Priority new features',    desc: 'Pro users get new tools first' },
  { icon: '💛', label: 'KwamKitt Pro badge',       desc: 'Exclusive supporter status' },
];

export default function ProScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  function handleSubscribe() {
    // TODO: Implement RevenueCat or Google Play Billing
    // For now show a coming soon message
    Alert.alert(
      '🚀 Coming Soon',
      'In-app subscriptions are being set up. To subscribe early or for more info, contact us at lifeapp@kwamkitt.com',
      [
        { text: 'Email Us', onPress: () => Linking.openURL('mailto:lifeapp@kwamkitt.com') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  }

  function handleRestore() {
    Alert.alert('Restore Purchase', 'No previous purchase found on this account.', [{ text: 'OK' }]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Life App Pro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSub}>Support Life App and enjoy an ad-free experience</Text>
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceCurrency}>£</Text>
          <Text style={styles.priceAmount}>1</Text>
          <View>
            <Text style={styles.pricePer}>per</Text>
            <Text style={styles.pricePer}>one-time</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What you get</Text>
          {FEATURES.map(f => (
            <View key={f.label} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        {/* Subscribe button */}
        <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.85}>
          <Text style={styles.subscribeBtnText}>Get Pro — £1 One-Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
          <Text style={styles.restoreBtnText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          One-time purchase of £1.00. No subscription, no recurring charges. By purchasing you agree to our Terms of Service and Privacy Policy.
        </Text>

        {/* KwamKitt branding */}
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>by KwamKitt</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { padding: 24, gap: 20 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: 24, backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.xl, borderWidth: 2, borderColor: COLORS.accent,
  },
  priceCurrency: { fontSize: 28, fontWeight: '300', color: COLORS.accentText, alignSelf: 'flex-start', marginTop: 8 },
  priceAmount: { fontSize: 72, fontWeight: '700', color: COLORS.accentText, lineHeight: 80 },
  pricePer: { fontSize: 14, color: COLORS.accentText, opacity: 0.8, lineHeight: 18 },
  features: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 20, gap: 16, borderWidth: 0.5, borderColor: COLORS.border },
  featuresTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  featureDesc: { fontSize: 12, color: COLORS.textTertiary, marginTop: 1 },
  featureCheck: { fontSize: 16, color: COLORS.success, fontWeight: '700' },
  subscribeBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.xl,
    padding: 18, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  subscribeBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  restoreBtn: { alignItems: 'center', padding: 12 },
  restoreBtnText: { fontSize: 14, color: COLORS.textSecondary },
  legal: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'center', lineHeight: 17 },
  brandRow: { alignItems: 'center', paddingTop: 8 },
  brandText: { fontSize: 13, color: COLORS.textTertiary },
});
