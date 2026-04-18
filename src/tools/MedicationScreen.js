import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const FREQUENCIES = ['Daily', 'Twice daily', 'Every 8h', 'Weekly', 'As needed'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

export default function MedicationScreen({ navigation }) {
  const [meds, setMeds]       = useState([]);
  const [adding, setAdding]   = useState(false);
  const [name, setName]       = useState('');
  const [dose, setDose]       = useState('');
  const [freq, setFreq]       = useState('Daily');
  const [time, setTime]       = useState('Morning');

  function addMed() {
    if (!name.trim()) return;
    setMeds(prev => [...prev, {
      id: Date.now().toString(), name: name.trim(),
      dose: dose.trim(), freq, time, taken: false,
    }]);
    setName(''); setDose(''); setFreq('Daily'); setTime('Morning');
    setAdding(false);
  }

  function toggleTaken(id) {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  }

  function deleteMed(id) {
    Alert.alert('Remove Medication', 'Remove this medication?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setMeds(prev => prev.filter(m => m.id !== id)) },
    ]);
  }

  function resetDay() {
    setMeds(prev => prev.map(m => ({ ...m, taken: false })));
  }

  const taken = meds.filter(m => m.taken).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medication</Text>
        {meds.length > 0 && <TouchableOpacity onPress={resetDay}><Text style={styles.resetBtn}>Reset day</Text></TouchableOpacity>}
      </View>

      {/* Summary */}
      {meds.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{taken} of {meds.length} taken today</Text>
          <View style={styles.summaryBar}>
            <View style={[styles.summaryFill, { width: `${meds.length > 0 ? (taken/meds.length)*100 : 0}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        data={meds}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyText}>No medications added yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.medCard, item.taken && styles.medCardTaken]}>
            <TouchableOpacity style={[styles.check, item.taken && styles.checkDone]}
              onPress={() => toggleTaken(item.id)}>
              {item.taken && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.medInfo}>
              <Text style={[styles.medName, item.taken && styles.medNameTaken]}>{item.name}</Text>
              <Text style={styles.medDetails}>{item.dose ? `${item.dose} · ` : ''}{item.freq} · {item.time}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteMed(item.id)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* Add form */}
      {adding ? (
        <View style={styles.addForm}>
          <TextInput style={styles.addInput} value={name} onChangeText={setName}
            placeholder="Medication name" placeholderTextColor={COLORS.textTertiary} />
          <TextInput style={styles.addInput} value={dose} onChangeText={setDose}
            placeholder="Dose (e.g. 10mg)" placeholderTextColor={COLORS.textTertiary} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {FREQUENCIES.map(f => (
              <TouchableOpacity key={f} style={[styles.chip, freq === f && styles.chipActive]} onPress={() => setFreq(f)}>
                <Text style={[styles.chipText, freq === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {TIMES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, time === t && styles.chipActive]} onPress={() => setTime(t)}>
                <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.addFormBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={addMed}>
              <Text style={styles.saveBtnText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
          <Text style={styles.addBtnText}>+ Add Medication</Text>
        </TouchableOpacity>
      )}

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
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  resetBtn: { fontSize: 13, color: COLORS.accent },
  summary: { padding: 16, gap: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  summaryText: { fontSize: 13, color: COLORS.textSecondary },
  summaryBar: { height: 4, backgroundColor: COLORS.bgTertiary, borderRadius: 2 },
  summaryFill: { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
  list: { padding: 16, gap: 10 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: COLORS.textTertiary },
  medCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border,
  },
  medCardTaken: { opacity: 0.6 },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  medNameTaken: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  medDetails: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  deleteBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  addForm: {
    padding: 16, borderTopWidth: 0.5, borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg, gap: 10,
  },
  addInput: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 12, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
  },
  chips: { maxHeight: 40 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 0.5, borderColor: COLORS.border, marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.accentText, fontWeight: '500' },
  addFormBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: COLORS.textSecondary },
  saveBtn: { flex: 2, padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  addBtn: {
    margin: 16, padding: 14, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  addBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
