import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const UNIT_DATA = {
  Length:      { icon:'📏', units:['Metres','Kilometres','Miles','Feet','Inches','Centimetres','Millimetres'], toBase:[1,1000,1609.344,0.3048,0.0254,0.01,0.001] },
  Weight:      { icon:'⚖️', units:['Kilograms','Grams','Pounds','Ounces','Stones','Tonnes'], toBase:[1,0.001,0.453592,0.0283495,6.35029,1000] },
  Temperature: { icon:'🌡️', units:['Celsius','Fahrenheit','Kelvin'], toBase:null },
  Speed:       { icon:'💨', units:['km/h','mph','m/s','Knots'], toBase:[1,1.60934,3.6,1.852] },
  Area:        { icon:'🗺️', units:['m²','km²','Acres','Hectares','ft²'], toBase:[1,1e6,4046.86,10000,0.092903] },
  Volume:      { icon:'🧴', units:['Litres','Millilitres','Gallons (UK)','Gallons (US)','Pints'], toBase:[1,0.001,4.54609,3.78541,0.568261] },
};

function convertTemp(val, fi, ti) {
  let c = fi===0?val:fi===1?(val-32)*5/9:val-273.15;
  return ti===0?c:ti===1?c*9/5+32:c+273.15;
}

export default function UnitConverterScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const cats = Object.keys(UNIT_DATA);
  const [cat, setCat]     = useState('Length');
  const [from, setFrom]   = useState(0);
  const [to, setTo]       = useState(1);
  const [value, setValue] = useState('');
  const data = UNIT_DATA[cat];

  function getResult() {
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    try {
      if (cat === 'Temperature') return parseFloat(convertTemp(num,from,to).toFixed(6)).toLocaleString();
      return parseFloat((num * data.toBase[from] / data.toBase[to]).toFixed(8)).toLocaleString();
    } catch { return 'Error'; }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Unit Converter</Text>
      </View>
      <AdBanner />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {cats.map(c => (
          <TouchableOpacity key={c} style={[styles.catBtn, cat===c && styles.catBtnActive]}
            onPress={() => { setCat(c); setFrom(0); setTo(1); setValue(''); }}>
            <Text style={styles.catIcon}>{UNIT_DATA[c].icon}</Text>
            <Text style={[styles.catLabel, cat===c && styles.catLabelActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Input at top */}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={`Enter ${data.units[from]}`}
            placeholderTextColor={COLORS.textTertiary}
          />

          {/* Unit selectors */}
          <View style={styles.unitRow}>
            {[{label:'From',idx:from,set:setFrom},{label:'To',idx:to,set:setTo}].map(({label,idx,set}) => (
              <View key={label} style={styles.unitCol}>
                <Text style={styles.unitColLabel}>{label}</Text>
                <ScrollView style={styles.unitList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {data.units.map((u, i) => (
                    <TouchableOpacity key={u} style={[styles.unitItem, idx===i && styles.unitItemActive]}
                      onPress={() => set(i)}>
                      <Text style={[styles.unitText, idx===i && styles.unitTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>

          {/* Result */}
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{data.units[from]} → {data.units[to]}</Text>
            <Text style={styles.resultValue}>{getResult()}</Text>
            <Text style={styles.resultUnit}>{data.units[to]}</Text>
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
  catScroll: { maxHeight: 56, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  catContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  catBtnActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  catIcon: { fontSize: 13 },
  catLabel: { fontSize: 12, color: COLORS.textSecondary },
  catLabelActive: { color: COLORS.accentText, fontWeight: '500' },
  content: { padding: 16, gap: 14 },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, fontSize: 20, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  unitRow: { flexDirection: 'row', gap: 12 },
  unitCol: { flex: 1 },
  unitColLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 6 },
  unitList: { maxHeight: 180, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md },
  unitItem: { paddingVertical: 10, paddingHorizontal: 12 },
  unitItemActive: { backgroundColor: COLORS.accentLight },
  unitText: { fontSize: 13, color: COLORS.textSecondary },
  unitTextActive: { color: COLORS.accentText, fontWeight: '500' },
  resultBox: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 8 },
  resultValue: { fontSize: 36, fontWeight: '300', color: COLORS.textPrimary },
  resultUnit: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
