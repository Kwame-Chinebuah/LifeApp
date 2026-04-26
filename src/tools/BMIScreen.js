import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#378ADD' };
  if (bmi < 25)   return { label: 'Healthy',     color: '#3B6D11' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#EF9F27' };
  return              { label: 'Obese',        color: '#A32D2D' };
}

export default function BMIScreen({ navigation }) {
  const [unit,     setUnit]     = useState('metric');
  const [height,   setHeight]   = useState('');
  const [weight,   setWeight]   = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  function calcBMI() {
    if (unit === 'metric') {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (!h || !w || h <= 0 || w <= 0) return null;
      return w / (h * h);
    } else {
      const ft  = parseFloat(heightFt) || 0;
      const ins = parseFloat(heightIn) || 0;
      const totalInches = (ft * 12) + ins;
      const w = parseFloat(weight);
      if (!totalInches || !w || totalInches <= 0 || w <= 0) return null;
      return (w / (totalInches * totalInches)) * 703;
    }
  }

  const bmi = calcBMI();
  const cat = bmi ? getBMICategory(bmi) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BMI Calculator</Text>
      </View>
      <AdBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Unit toggle */}
          <View style={styles.unitRow}>
            {[
              { id: 'metric',   label: 'Metric\n(kg / cm)' },
              { id: 'imperial', label: 'Imperial\n(lb / ft in)' },
            ].map(u => (
              <TouchableOpacity key={u.id}
                style={[styles.unitBtn, unit === u.id && styles.unitBtnActive]}
                onPress={() => { setUnit(u.id); setHeight(''); setWeight(''); setHeightFt(''); setHeightIn(''); }}>
                <Text style={[styles.unitBtnText, unit === u.id && styles.unitBtnTextActive]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Height */}
          <View style={styles.field}>
            <Text style={styles.label}>Height</Text>
            {unit === 'metric' ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="175"
                  placeholderTextColor={COLORS.textTertiary}
                />
                <Text style={styles.unitLabel}>cm</Text>
              </View>
            ) : (
              <View style={styles.ftRow}>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={heightFt}
                    onChangeText={setHeightFt}
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                  <Text style={styles.unitLabel}>ft</Text>
                </View>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={heightIn}
                    onChangeText={setHeightIn}
                    keyboardType="decimal-pad"
                    placeholder="10"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                  <Text style={styles.unitLabel}>in</Text>
                </View>
              </View>
            )}
          </View>

          {/* Weight */}
          <View style={styles.field}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder={unit === 'metric' ? '70' : '154'}
                placeholderTextColor={COLORS.textTertiary}
              />
              <Text style={styles.unitLabel}>{unit === 'metric' ? 'kg' : 'lb'}</Text>
            </View>
          </View>

          {/* Result */}
          {bmi && cat && (
            <View style={[styles.result, { borderColor: cat.color }]}>
              <Text style={styles.resultLabel}>Your BMI</Text>
              <Text style={[styles.resultBMI, { color: cat.color }]}>{bmi.toFixed(1)}</Text>
              <Text style={[styles.resultCat, { color: cat.color }]}>{cat.label}</Text>
              <View style={styles.scale}>
                {[
                  { label: 'Underweight', range: '< 18.5',    color: '#378ADD' },
                  { label: 'Healthy',     range: '18.5–24.9', color: '#3B6D11' },
                  { label: 'Overweight',  range: '25–29.9',   color: '#EF9F27' },
                  { label: 'Obese',       range: '≥ 30',      color: '#A32D2D' },
                ].map(s => (
                  <View key={s.label} style={styles.scaleItem}>
                    <View style={[styles.scaleColor, { backgroundColor: s.color }]} />
                    <Text style={styles.scaleLabel}>{s.label}</Text>
                    <Text style={styles.scaleRange}>{s.range}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.bg },
  topbar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText:      { fontSize: 13, color: COLORS.textSecondary },
  title:         { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content:       { padding: 20, gap: 24 },
  unitRow:       { flexDirection: 'row', gap: 12 },
  unitBtn:       { flex: 1, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.bgSecondary },
  unitBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  unitBtnText:   { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, textAlign: 'center' },
  unitBtnTextActive: { color: '#fff' },
  field:         { gap: 10 },
  label:         { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  inputRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ftRow:         { flexDirection: 'row', gap: 16 },
  input: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 28, fontWeight: '300',
    color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
    textAlign: 'center',
  },
  unitLabel:     { fontSize: 16, color: COLORS.textSecondary, minWidth: 32 },
  result:        { padding: 24, borderRadius: RADIUS.xl, borderWidth: 2, backgroundColor: COLORS.bgSecondary, alignItems: 'center', gap: 6 },
  resultLabel:   { fontSize: 13, color: COLORS.textTertiary },
  resultBMI:     { fontSize: 64, fontWeight: '300', lineHeight: 72 },
  resultCat:     { fontSize: 20, fontWeight: '500', marginBottom: 12 },
  scale:         { width: '100%', gap: 8 },
  scaleItem:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scaleColor:    { width: 14, height: 14, borderRadius: 7 },
  scaleLabel:    { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  scaleRange:    { fontSize: 12, color: COLORS.textTertiary },
});
