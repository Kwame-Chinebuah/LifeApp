import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#378ADD' };
  if (bmi < 25)   return { label: 'Healthy',     color: COLORS.success };
  if (bmi < 30)   return { label: 'Overweight',  color: '#EF9F27' };
  return              { label: 'Obese',        color: COLORS.danger };
}

export default function BMIScreen({ navigation }) {
  const [unit, setUnit]     = useState('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  function calcBMI() {
    if (unit === 'metric') {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (!h || !w) return null;
      return w / (h * h);
    } else {
      const inches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      const w = parseFloat(weight);
      if (!inches || !w) return null;
      return (w / (inches * inches)) * 703;
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Unit toggle */}
        <View style={styles.unitRow}>
          {['metric', 'imperial'].map(u => (
            <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}>
              <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>
                {u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lb/ft)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Height */}
        <View style={styles.field}>
          <Text style={styles.label}>Height</Text>
          {unit === 'metric' ? (
            <View style={styles.inputWithUnit}>
              <TextInput style={styles.input} value={height} onChangeText={setHeight}
                keyboardType="numeric" placeholder="175" placeholderTextColor={COLORS.textTertiary} />
              <Text style={styles.unit}>cm</Text>
            </View>
          ) : (
            <View style={styles.ftRow}>
              <View style={styles.inputWithUnit}>
                <TextInput style={styles.input} value={heightFt} onChangeText={setHeightFt}
                  keyboardType="numeric" placeholder="5" placeholderTextColor={COLORS.textTertiary} />
                <Text style={styles.unit}>ft</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput style={styles.input} value={heightIn} onChangeText={setHeightIn}
                  keyboardType="numeric" placeholder="10" placeholderTextColor={COLORS.textTertiary} />
                <Text style={styles.unit}>in</Text>
              </View>
            </View>
          )}
        </View>

        {/* Weight */}
        <View style={styles.field}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputWithUnit}>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight}
              keyboardType="numeric" placeholder={unit === 'metric' ? '70' : '154'}
              placeholderTextColor={COLORS.textTertiary} />
            <Text style={styles.unit}>{unit === 'metric' ? 'kg' : 'lb'}</Text>
          </View>
        </View>

        {/* Result */}
        {bmi && cat && (
          <View style={[styles.result, { borderColor: cat.color }]}>
            <Text style={styles.resultBMILabel}>Your BMI</Text>
            <Text style={[styles.resultBMI, { color: cat.color }]}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.resultCat, { color: cat.color }]}>{cat.label}</Text>
            <View style={styles.scale}>
              {[
                { label: 'Underweight', range: '< 18.5', color: '#378ADD' },
                { label: 'Healthy',     range: '18.5–24.9', color: COLORS.success },
                { label: 'Overweight',  range: '25–29.9', color: '#EF9F27' },
                { label: 'Obese',       range: '≥ 30', color: COLORS.danger },
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
  unitRow: { flexDirection: 'row', gap: 10 },
  unitBtn: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  unitBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  unitBtnText: { fontSize: 13, color: COLORS.textSecondary },
  unitBtnTextActive: { color: COLORS.accentText, fontWeight: '500' },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  inputWithUnit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: 14, fontSize: 22, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
  },
  unit: { fontSize: 16, color: COLORS.textSecondary, width: 30 },
  ftRow: { flexDirection: 'row', gap: 12 },
  result: {
    padding: 20, borderRadius: RADIUS.xl, borderWidth: 2,
    backgroundColor: COLORS.bgSecondary, alignItems: 'center', gap: 6,
  },
  resultBMILabel: { fontSize: 13, color: COLORS.textTertiary },
  resultBMI: { fontSize: 64, fontWeight: '300', lineHeight: 72 },
  resultCat: { fontSize: 20, fontWeight: '500', marginBottom: 12 },
  scale: { width: '100%', gap: 6 },
  scaleItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scaleColor: { width: 12, height: 12, borderRadius: 6 },
  scaleLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  scaleRange: { fontSize: 12, color: COLORS.textTertiary },
});
