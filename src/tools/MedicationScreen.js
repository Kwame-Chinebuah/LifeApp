import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  FlatList, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import { useTheme } from '../data/ThemeContext';
import AdBanner from '../components/AdBanner';

const KEY      = 'medications';
const DONE_KEY = () => `med_done_${new Date().toDateString()}`;
const FREQS    = ['Daily', 'Twice daily', 'Every 8h', 'Weekly', 'As needed'];
const TIMES    = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

export default function MedicationScreen({ navigation }) {
  const { COLORS: dynCOLORS } = useTheme();
  const [meds, setMeds]     = useState([]);
  const [done, setDone]     = useState([]);
  const [adding, setAdding] = useState(false);
  const [name, setName]     = useState('');
  const [dose, setDose]     = useState('');
  const [freq, setFreq]     = useState('Daily');
  const [time, setTime]     = useState('Morning');

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(DONE_KEY())])
      .then(([m, d]) => { if (m) setMeds(JSON.parse(m)); if (d) setDone(JSON.parse(d)); })
      .catch(() => {});
  }, []);

  async function saveMeds(next) { setMeds(next); try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {} }
  async function saveDone(next) { setDone(next); try { await AsyncStorage.setItem(DONE_KEY(), JSON.stringify(next)); } catch {} }

  function addMed() {
    if (!name.trim()) return;
    saveMeds([...meds, { id: Date.now().toString(), name: name.trim(), dose: dose.trim(), freq, time }]);
    setName(''); setDose(''); setFreq('Daily'); setTime('Morning');
    setAdding(false);
  }

  function toggleDone(id) { saveDone(done.includes(id) ? done.filter(d => d !== id) : [...done, id]); }
  function deleteMed(id) {
    Alert.alert('Remove', 'Remove this medication?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => saveMeds(meds.filter(m => m.id !== id)) },
    ]);
  }

  const takenCount = done.length;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dynCOLORS.bg }]}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medication</Text>
        {takenCount > 0 && (
          <TouchableOpacity onPress={() => saveDone([])}>
            <Text style={styles.resetBtn}>Reset day</Text>
          </TouchableOpacity>
        )}
      </View>
      <AdBanner />

      {meds.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{takenCount} of {meds.length} taken today</Text>
          <View style={styles.summaryBar}>
            <View style={[styles.summaryFill, { width: `${(takenCount/meds.length)*100}%` }]} />
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {adding ? (
          // ── Add form as scrollable view ──────────────────────
          <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.formTitle}>Add Medication</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Medication name"
              placeholderTextColor={COLORS.textTertiary}
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={dose}
              onChangeText={setDose}
              placeholder="Dose (e.g. 10mg)"
              placeholderTextColor={COLORS.textTertiary}
            />
            <Text style={styles.chipLabel}>Frequency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
              {FREQS.map(f => (
                <TouchableOpacity key={f} style={[styles.chip, freq === f && styles.chipActive]} onPress={() => setFreq(f)}>
                  <Text style={[styles.chipText, freq === f && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.chipLabel}>Time of day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
              {TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, time === t && styles.chipActive]} onPress={() => setTime(t)}>
                  <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addMed}>
                <Text style={styles.saveText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <>
            <FlatList
              data={meds}
              keyExtractor={m => m.id}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>💊</Text>
                  <Text style={styles.emptyText}>No medications added yet</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isDone = done.includes(item.id);
                return (
                  <View style={[styles.medCard, isDone && styles.medCardDone]}>
                    <TouchableOpacity style={[styles.check, isDone && styles.checkDone]} onPress={() => toggleDone(item.id)}>
                      {isDone && <Text style={styles.checkMark}>✓</Text>}
                    </TouchableOpacity>
                    <View style={styles.medInfo}>
                      <Text style={[styles.medName, isDone && styles.medNameDone]}>{item.name}</Text>
                      <Text style={styles.medDetails}>{item.dose ? `${item.dose} · ` : ''}{item.freq} · {item.time}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteMed(item.id)} hitSlop={{ top:10,right:10,bottom:10,left:10 }}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListFooterComponent={<View style={{ height: 80 }} />}
            />
            <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
              <Text style={styles.addBtnText}>+ Add Medication</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  resetBtn: { fontSize: 13, color: COLORS.accent },
  summary: { padding: 16, gap: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  summaryText: { fontSize: 13, color: COLORS.textSecondary },
  summaryBar: { height: 4, backgroundColor: COLORS.bgTertiary, borderRadius: 2 },
  summaryFill: { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
  formScroll: { padding: 16, gap: 12 },
  formTitle: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary },
  chipLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
  chips: { maxHeight: 44 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.accentText, fontWeight: '500' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 15, color: COLORS.textSecondary },
  saveBtn: { flex: 2, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: COLORS.textTertiary },
  medCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  medCardDone: { opacity: 0.6 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  medNameDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  medDetails: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  deleteBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  addBtn: { margin: 16, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center' },
  addBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
