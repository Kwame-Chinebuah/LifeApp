import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const TIP_PRESETS = [0, 10, 12.5, 15, 18, 20, 25];

export default function TipCalculatorScreen({ navigation }) {
  const [bill, setBill]       = useState('');
  const [tipPct, setTipPct]   = useState(15);
  const [people, setPeople]   = useState(1);
  const [customTip, setCustomTip] = useState('');

  const billNum   = parseFloat(bill) || 0;
  const activeTip = customTip !== '' ? (parseFloat(customTip) || 0) : tipPct;
  const tipAmt    = billNum * activeTip / 100;
  const total     = billNum + tipAmt;
  const perHead   = people >= 1 ? total / people : total;

  function incPeople() { setPeople(p => p + 1); }
  function decPeople() { setPeople(p => Math.max(1, p - 1)); }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tip & Split</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Bill input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Bill Total</Text>
          <View style={styles.billInputWrap}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.billInput}
              value={bill}
              onChangeText={setBill}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Tip selector */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Tip</Text>
          <View style={styles.tipGrid}>
            {TIP_PRESETS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.tipBtn, activeTip === p && customTip === '' && styles.tipBtnActive]}
                onPress={() => { setTipPct(p); setCustomTip(''); }}
                activeOpacity={0.7}>
                <Text style={[styles.tipBtnText, activeTip === p && customTip === '' && styles.tipBtnTextActive]}>
                  {p}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.customTipInput}
            value={customTip}
            onChangeText={setCustomTip}
            keyboardType="decimal-pad"
            placeholder="Custom tip %"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Split between */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Split Between</Text>
          <View style={styles.peopleRow}>
            <TouchableOpacity style={styles.peopleBtn} onPress={decPeople} activeOpacity={0.7}>
              <Text style={styles.peopleBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.peopleCenter}>
              <Text style={styles.peopleCount}>{people}</Text>
              <Text style={styles.peopleLabel}>{people === 1 ? 'person' : 'people'}</Text>
            </View>
            <TouchableOpacity style={styles.peopleBtn} onPress={incPeople} activeOpacity={0.7}>
              <Text style={styles.peopleBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        <View style={styles.results}>
          <View style={styles.resultRow}>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Tip</Text>
              <Text style={styles.resultCardValue}>£{tipAmt.toFixed(2)}</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Total</Text>
              <Text style={styles.resultCardValue}>£{total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.perPersonCard}>
            <Text style={styles.perPersonLabel}>
              Per Person {people > 1 ? `(${people} people)` : ''}
            </Text>
            <Text style={styles.perPersonValue}>£{perHead.toFixed(2)}</Text>
            {people > 1 && (
              <Text style={styles.perPersonSub}>
                £{billNum.toFixed(2)} + £{tipAmt.toFixed(2)} tip ÷ {people}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

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
  content: { padding: 20, gap: 20 },
  inputSection: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  billInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 16,
  },
  currencySymbol: { fontSize: 28, color: COLORS.textSecondary, marginRight: 6 },
  billInput: { flex: 1, fontSize: 32, fontWeight: '300', color: COLORS.textPrimary, paddingVertical: 14 },
  tipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  tipBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tipBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  tipBtnTextActive: { color: '#fff' },
  customTipInput: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 12, fontSize: 16, color: COLORS.textPrimary,
    backgroundColor: COLORS.bgSecondary,
  },
  peopleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg,
    borderWidth: 0.5, borderColor: COLORS.border, overflow: 'hidden',
  },
  peopleBtn: {
    width: 60, height: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgTertiary,
  },
  peopleBtnText: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '300' },
  peopleCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  peopleCount: { fontSize: 32, fontWeight: '500', color: COLORS.textPrimary },
  peopleLabel: { fontSize: 12, color: COLORS.textTertiary },
  results: { gap: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultCard: {
    flex: 1, padding: 16, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgSecondary, borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center',
  },
  resultCardLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  resultCardValue: { fontSize: 22, fontWeight: '500', color: COLORS.textPrimary },
  perPersonCard: {
    padding: 20, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.accentLight, borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', gap: 4,
  },
  perPersonLabel: { fontSize: 13, color: COLORS.accentText },
  perPersonValue: { fontSize: 42, fontWeight: '600', color: COLORS.accentText },
  perPersonSub: { fontSize: 12, color: COLORS.accentText, opacity: 0.7 },
});
