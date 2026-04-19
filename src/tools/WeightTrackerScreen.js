import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const KEY = 'weight_tracker';

export default function WeightTrackerScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [weight,  setWeight]  = useState('');
  const [unit,    setUnit]    = useState('kg');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(d => { if (d) setEntries(JSON.parse(d)); }).catch(() => {});
  }, []);

  async function addEntry() {
    const w = parseFloat(weight);
    if (!w) return;
    const now   = new Date();
    const entry = { id: Date.now().toString(), weight: w, unit, date: now.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) };
    const next  = [entry, ...entries];
    setEntries(next);
    setWeight('');
    try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function getDiff(cur, prev) {
    if (!prev) return null;
    return parseFloat(((cur - prev) / prev * 100).toFixed(1));
  }

  const latest   = entries[0];
  const diff     = latest && entries[1] ? getDiff(latest.weight, entries[1].weight) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Weight Tracker</Text>
        <View style={styles.unitToggle}>
          {['kg','lbs'].map(u => (
            <TouchableOpacity key={u} style={[styles.unitBtn, unit===u && styles.unitBtnActive]} onPress={() => setUnit(u)}>
              <Text style={[styles.unitText, unit===u && styles.unitTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <AdBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Log entry — at TOP so keyboard never covers it */}
          <View style={styles.addCard}>
            <Text style={styles.addLabel}>Log Today's Weight</Text>
            <View style={styles.addRow}>
              <TextInput style={styles.addInput} value={weight} onChangeText={setWeight}
                keyboardType="decimal-pad" placeholder={`Weight in ${unit}`}
                placeholderTextColor={COLORS.textTertiary} />
              <TouchableOpacity style={styles.addBtn} onPress={addEntry}>
                <Text style={styles.addBtnText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {latest && (
            <View style={styles.currentCard}>
              <Text style={styles.currentLabel}>Current Weight</Text>
              <Text style={styles.currentValue}>{latest.weight}<Text style={styles.currentUnit}> {latest.unit}</Text></Text>
              {diff !== null && (
                <View style={styles.diffRow}>
                  <Text style={[styles.diffIcon, diff > 0 ? styles.diffUp : styles.diffDown]}>{diff > 0 ? '↑' : '↓'}</Text>
                  <Text style={[styles.diffText, diff > 0 ? styles.diffUp : styles.diffDown]}>
                    {Math.abs(diff)}% {diff > 0 ? 'increase' : 'decrease'} from last entry
                  </Text>
                </View>
              )}
              <Text style={styles.currentDate}>{latest.date}</Text>
            </View>
          )}

          {entries.length > 0 && (
            <View style={styles.history}>
              <Text style={styles.historyTitle}>History</Text>
              {entries.map((e, i) => {
                const d = i < entries.length-1 ? getDiff(e.weight, entries[i+1].weight) : null;
                return (
                  <View key={e.id} style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyDate}>{e.date}</Text>
                      <Text style={styles.historyWeight}>{e.weight} {e.unit}</Text>
                    </View>
                    {d !== null && (
                      <Text style={[styles.historyDiff, d > 0 ? styles.diffUp : styles.diffDown]}>
                        {d > 0 ? '↑' : '↓'} {Math.abs(d)}%
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {entries.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📉</Text>
              <Text style={styles.emptyText}>Log your first weight above</Text>
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
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  unitToggle: { flexDirection: 'row', borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.bg },
  unitBtnActive: { backgroundColor: COLORS.accent },
  unitText: { fontSize: 13, color: COLORS.textSecondary },
  unitTextActive: { color: '#fff', fontWeight: '500' },
  content: { padding: 20, gap: 16 },
  addCard: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 0.5, borderColor: COLORS.border },
  addLabel: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  addRow: { flexDirection: 'row', gap: 10 },
  addInput: { flex: 1, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, fontSize: 18, color: COLORS.textPrimary, backgroundColor: COLORS.bg },
  addBtn: { paddingHorizontal: 20, borderRadius: RADIUS.md, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  currentCard: { backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', gap: 6, borderWidth: 0.5, borderColor: COLORS.border },
  currentLabel: { fontSize: 12, color: COLORS.textTertiary },
  currentValue: { fontSize: 52, fontWeight: '300', color: COLORS.textPrimary },
  currentUnit: { fontSize: 20, color: COLORS.textSecondary },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diffIcon: { fontSize: 18, fontWeight: '700' },
  diffText: { fontSize: 13, fontWeight: '500' },
  diffUp: { color: COLORS.danger },
  diffDown: { color: COLORS.success },
  currentDate: { fontSize: 12, color: COLORS.textTertiary },
  history: { gap: 8 },
  historyTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border },
  historyDate: { fontSize: 12, color: COLORS.textTertiary },
  historyWeight: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  historyDiff: { fontSize: 15, fontWeight: '600' },
  empty: { paddingTop: 40, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center' },
});
