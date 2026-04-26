// DiscountCalcScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const PRESETS = [5, 10, 15, 20, 25, 30, 40, 50, 70];

export const DiscountCalcScreen = ({ navigation }) => {
  const [price, setPrice]       = useState('');
  const [discount, setDiscount] = useState('20');
  const orig  = parseFloat(price) || 0;
  const disc  = parseFloat(discount) || 0;
  const saving = orig * disc / 100;
  const final  = orig - saving;

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Discount Calculator</Text>
      </View>
      <AdBanner />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.field}>
            <Text style={s.label}>Original Price (£)</Text>
            <TextInput style={s.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textTertiary} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Discount %</Text>
            <TextInput style={s.input} value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.textTertiary} />
          </View>
          <View style={s.presets}>
            {PRESETS.map(p => (
              <TouchableOpacity key={p} style={[s.preset, discount === String(p) && s.presetActive]} onPress={() => setDiscount(String(p))}>
                <Text style={[s.presetText, discount === String(p) && s.presetTextActive]}>{p}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.results}>
            <View style={s.resultRow}>
              <View style={[s.resultCard, { borderColor: COLORS.success }]}>
                <Text style={s.resultLabel}>You Save</Text>
                <Text style={[s.resultValue, { color: COLORS.success }]}>£{saving.toFixed(2)}</Text>
              </View>
              <View style={[s.resultCard, { borderColor: COLORS.accent }]}>
                <Text style={s.resultLabel}>Sale Price</Text>
                <Text style={[s.resultValue, { color: COLORS.accent }]}>£{final.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DiscountCalcScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { padding: 20, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 22, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  presetActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  presetText: { fontSize: 13, color: COLORS.textSecondary },
  presetTextActive: { color: COLORS.accentText, fontWeight: '500' },
  results: { gap: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultCard: { flex: 1, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1.5, backgroundColor: COLORS.bgSecondary, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  resultValue: { fontSize: 26, fontWeight: '500', color: COLORS.textPrimary },
});
