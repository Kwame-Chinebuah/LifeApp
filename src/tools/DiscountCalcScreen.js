import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const PRESETS = [5, 10, 15, 20, 25, 30, 40, 50, 70];

export default function DiscountCalcScreen({ navigation }) {
  const [price, setPrice]       = useState('');
  const [discount, setDiscount] = useState('20');

  const orig     = parseFloat(price) || 0;
  const disc     = parseFloat(discount) || 0;
  const saving   = orig * disc / 100;
  const final    = orig - saving;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Discount Calculator</Text>
      </View>

      <View style={styles.content}>
        {/* Original price */}
        <View style={styles.field}>
          <Text style={styles.label}>Original Price (£)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Discount % */}
        <View style={styles.field}>
          <Text style={styles.label}>Discount %</Text>
          <TextInput
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Preset buttons */}
        <View style={styles.presets}>
          {PRESETS.map(p => (
            <TouchableOpacity key={p}
              style={[styles.preset, discount === String(p) && styles.presetActive]}
              onPress={() => setDiscount(String(p))}>
              <Text style={[styles.presetText, discount === String(p) && styles.presetTextActive]}>
                {p}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <View style={styles.results}>
          <View style={styles.resultRow}>
            <View style={[styles.resultCard, { borderColor: COLORS.success }]}>
              <Text style={styles.resultLabel}>You Save</Text>
              <Text style={[styles.resultValue, { color: COLORS.success }]}>
                £{saving.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.resultCard, { borderColor: COLORS.accent }]}>
              <Text style={styles.resultLabel}>Sale Price</Text>
              <Text style={[styles.resultValue, { color: COLORS.accent }]}>
                £{final.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.resultFull}>
            <Text style={styles.resultLabel}>Original Price</Text>
            <Text style={styles.resultValue}>£{orig.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12,
  },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { flex: 1, padding: 20, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  input: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: 14, fontSize: 22, color: COLORS.textPrimary,
    backgroundColor: COLORS.bgSecondary,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  presetActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  presetText: { fontSize: 13, color: COLORS.textSecondary },
  presetTextActive: { color: COLORS.accentText, fontWeight: '500' },
  results: { gap: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultCard: {
    flex: 1, padding: 16,
    borderRadius: RADIUS.lg, borderWidth: 1.5,
    backgroundColor: COLORS.bgSecondary, alignItems: 'center',
  },
  resultFull: {
    padding: 16, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary, alignItems: 'center',
  },
  resultLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  resultValue: { fontSize: 26, fontWeight: '500', color: COLORS.textPrimary },
});
