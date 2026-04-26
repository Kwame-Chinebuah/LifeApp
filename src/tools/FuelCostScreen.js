import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

export default function FuelCostScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [distance,   setDistance]   = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [price,      setPrice]      = useState('');
  const [unit,       setUnit]       = useState('mpg');

  function calc() {
    const d = parseFloat(distance);
    const e = parseFloat(efficiency);
    const p = parseFloat(price);
    if (!d || !e || !p) return null;
    const litres = unit === 'mpg' ? (d / e) * 4.54609 : (d / 100) * e;
    return { litres, cost: litres * p };
  }

  const result = calc();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fuel Cost Estimator</Text>
      </View>
      <AdBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.unitRow}>
            {[['mpg','MPG (UK)'],['L100km','L/100km']].map(([u,l]) => (
              <TouchableOpacity key={u} style={[styles.unitBtn, unit===u && styles.unitBtnActive]} onPress={() => setUnit(u)}>
                <Text style={[styles.unitBtnText, unit===u && styles.unitBtnTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {[
            { label:'Trip Distance', value: distance, set: setDistance, unit:'miles', type:'decimal-pad' },
            { label:'Fuel Efficiency', value: efficiency, set: setEfficiency, unit: unit, type:'decimal-pad' },
            { label:'Fuel Price (£/litre)', value: price, set: setPrice, unit:'per litre', type:'decimal-pad' },
          ].map(f => (
            <View key={f.label} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} value={f.value} onChangeText={f.set}
                  keyboardType={f.type} placeholder="0" placeholderTextColor={COLORS.textTertiary} />
                <Text style={styles.unitLabel}>{f.unit}</Text>
              </View>
            </View>
          ))}
          {result && (
            <View style={styles.results}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Fuel Needed</Text>
                <Text style={styles.resultValue}>{result.litres.toFixed(1)}L</Text>
              </View>
              <View style={[styles.resultCard, { borderWidth: 2, borderColor: COLORS.accent }]}>
                <Text style={styles.resultLabel}>Trip Cost</Text>
                <Text style={[styles.resultValue, { fontSize: 36, color: COLORS.accent }]}>£{result.cost.toFixed(2)}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Cost per mile</Text>
                <Text style={styles.resultValue}>£{(result.cost / parseFloat(distance)).toFixed(3)}</Text>
              </View>
            </View>
          )}
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
  unitRow: { flexDirection: 'row', gap: 10 },
  unitBtn: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  unitBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  unitBtnText: { fontSize: 13, color: COLORS.textSecondary },
  unitBtnTextActive: { color: COLORS.accentText, fontWeight: '500' },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 20, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  unitLabel: { fontSize: 13, color: COLORS.textSecondary, minWidth: 50 },
  results: { gap: 12 },
  resultCard: { padding: 16, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  resultValue: { fontSize: 24, fontWeight: '500', color: COLORS.textPrimary },
});
