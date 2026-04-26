import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const TIP_PRESETS = [0, 10, 12.5, 15, 18, 20, 25];

export default function TipCalculatorScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [bill, setBill]     = useState('');
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);
  const [custom, setCustom] = useState('');

  const billNum   = parseFloat(bill) || 0;
  const activeTip = custom !== '' ? (parseFloat(custom) || 0) : tipPct;
  const tipAmt    = billNum * activeTip / 100;
  const total     = billNum + tipAmt;
  const perHead   = people >= 1 ? total / people : total;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tip & Split</Text>
      </View>
      <AdBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>Bill Total</Text>
            <View style={styles.billRow}>
              <Text style={styles.currency}>£</Text>
              <TextInput style={styles.billInput} value={bill} onChangeText={setBill}
                keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textTertiary} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tip %</Text>
            <View style={styles.presets}>
              {TIP_PRESETS.map(p => (
                <TouchableOpacity key={p}
                  style={[styles.preset, activeTip === p && custom === '' && styles.presetActive]}
                  onPress={() => { setTipPct(p); setCustom(''); }}>
                  <Text style={[styles.presetText, activeTip === p && custom === '' && styles.presetTextActive]}>{p}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={custom} onChangeText={setCustom}
              keyboardType="decimal-pad" placeholder="Custom %" placeholderTextColor={COLORS.textTertiary} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Split Between</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(p => Math.max(1, p - 1))}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepCenter}>
                <Text style={styles.stepValue}>{people}</Text>
                <Text style={styles.stepLabel}>{people === 1 ? 'person' : 'people'}</Text>
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(p => Math.min(50, p + 1))}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.results}>
            <View style={styles.resultRow}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Tip</Text>
                <Text style={styles.resultValue}>£{tipAmt.toFixed(2)}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Total</Text>
                <Text style={styles.resultValue}>£{total.toFixed(2)}</Text>
              </View>
            </View>
            <View style={[styles.resultCard, styles.resultCardMain]}>
              <Text style={styles.resultLabel}>Per Person {people > 1 ? `(÷${people})` : ''}</Text>
              <Text style={[styles.resultValue, { fontSize: 36, color: COLORS.accent }]}>£{perHead.toFixed(2)}</Text>
              {people > 1 && <Text style={styles.resultSub}>£{billNum.toFixed(2)} + £{tipAmt.toFixed(2)} tip ÷ {people}</Text>}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { padding: 20, gap: 20 },
  field: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  billRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 16 },
  currency: { fontSize: 28, color: COLORS.textSecondary, marginRight: 6 },
  billInput: { flex: 1, fontSize: 32, fontWeight: '300', color: COLORS.textPrimary, paddingVertical: 14 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  presetActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  presetText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  presetTextActive: { color: '#fff' },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, fontSize: 16, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, overflow: 'hidden' },
  stepBtn: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgTertiary },
  stepBtnText: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '300' },
  stepCenter: { flex: 1, alignItems: 'center' },
  stepValue: { fontSize: 32, fontWeight: '500', color: COLORS.textPrimary },
  stepLabel: { fontSize: 12, color: COLORS.textTertiary },
  results: { gap: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultCard: { flex: 1, padding: 16, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary, alignItems: 'center' },
  resultCardMain: { borderWidth: 2, borderColor: COLORS.accent },
  resultLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  resultValue: { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary },
  resultSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4 },
});
